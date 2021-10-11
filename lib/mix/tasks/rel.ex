defmodule Mix.Tasks.Rel do
  use Mix.Task

  @start_apps [
    :porcelain
  ]

  @shortdoc "Release the production binary"

  @moduledoc """

  """

  @doc false
  def run(args) do
    # Application.put_env(:phoenix, :serve_endpoints, true, persistent: true)
    # Mix.Tasks.Run.run(run_args() ++ args)
    run_args()
  end

  defp run_args do
    Enum.each(@start_apps, &Application.ensure_all_started/1)
    IO.puts("initiating...3.0")
    server = Application.get_env(:blue_potion, :server)
    project = Application.get_env(:blue_potion, :project)

    # if iex_running?(), do: [], else: ["--no-halt"]
    IO.puts("releasing to...#{server.url} #{project.vsn}")

    prod_secret = File.cwd!() <> "/config/prod.secret.exs"

    prod_secret_res = File.exists?(prod_secret)
    IO.puts("prod secret there? #{prod_secret_res}")

    if project != nil do
      rel_task_ex = File.cwd!() <> "/lib/#{project.alias_name}" <> "/release_task.ex"
      res = File.exists?(prod_secret)
      IO.puts("rel_task_ex there? #{res}")
      app_dir = Application.app_dir(:blue_potion)

      file =
        Mix.Generator.create_file(
          rel_task_ex,
          EEx.eval_file("#{app_dir}/priv/templates/release_task.ex", project: project)
        )
    end

    result = Porcelain.shell("mix distillery.init ")
    IO.puts(result.out)

    rel_folder = File.cwd!() <> "/rel/commands"
    res = File.exists?(rel_folder)

    if res == false do
      File.mkdir(rel_folder)
    end

    migrate_sh = File.cwd!() <> "/rel/commands/migrate.sh"
    res = File.exists?(migrate_sh)

    if res == false do
      File.touch(migrate_sh)

      a =
        File.write(
          migrate_sh,
          ~s(#!/bin/sh
      $RELEASE_ROOT_DIR/bin/#{project.alias_name} command Elixir.#{project.name}.ReleaseTasks seed)
        )

      IO.inspect(a)
    end

    migrate_exs = File.cwd!() <> "/rel/config.exs"
    res = File.exists?(migrate_exs)

    if res == true do
      {:ok, bin} = File.read(migrate_exs)

      new_bin =
        Regex.replace(
          ~r/:runtime_tools\n.{0,}\]\nend\n/,
          bin,
          ":runtime_tools\n\]\n  set(commands: [migrate: \"rel/commands/migrate.sh\"])end\n"
        )

      File.write(migrate_exs, new_bin)
      #   File.touch(migrate_exs)

      #   app_dir = Application.app_dir(:blue_potion)

      #   file =
      #     Mix.Generator.create_file(
      #       migrate_exs,
      #       EEx.eval_file("#{app_dir}/priv/templates/migrate.exs", project: project)
      #     )
    end

    if prod_secret_res do
      IO.puts("releasing for production...")

      result_secret = Porcelain.shell("mix phx.gen.secret ")

      IO.puts(result_secret.out)
      oo = result_secret.out |> String.trim()

      result =
        Porcelain.shell(
          "DATABASE_URL=ecto://postgres:postgres@#{server.db_url}/#{project.alias_name}_prod SECRET_KEY_BASE=#{
            oo
          } MIX_ENV=prod mix distillery.release"
        )

      IO.puts(result.out)

      # need to copy the sh file over as well...

      project_sh = File.cwd!() <> "/rel/commands/project.sh"
      res = File.exists?(project_sh)

      if res == false do
        File.touch(project_sh)

        a =
          File.write(
            project_sh,
            ~s(#!/bin/sh
            cd /#{project.alias_name}
            echo #{server.key} | sudo -S tar xfz #{project.alias_name}.tar.gz
            sudo mv /#{project.alias_name}/#{project.alias_name}.tar.gz /#{project.alias_name}/releases/#{
              project.vsn
            }/
            sudo /#{project.alias_name}/bin/#{project.alias_name} stop
            sudo /#{project.alias_name}/bin/#{project.alias_name} migrate
            sudo /#{project.alias_name}/bin/#{project.alias_name} start
            )
          )

        IO.inspect(a)
      end

      result =
        Porcelain.shell(
          "sshpass -p #{server.key} scp #{project_sh} #{server.username}@#{server.url}:/#{
            project.alias_name
          }"
        )

      IO.puts(result.out)

      result =
        Porcelain.shell(
          "sshpass -p #{server.key} scp #{File.cwd!()}/_build/prod/rel/#{project.alias_name}/releases/#{
            project.vsn
          }/#{project.alias_name}.tar.gz #{server.username}@#{server.url}:/#{project.alias_name}"
        )

      IO.puts(result.out)
    else
      IO.puts("please check your production release, esp prod secret")
    end

    []
  end
end
