defmodule Mix.Tasks.Ssl do
  use Mix.Task
  require IEx

  @start_apps [
    :porcelain,
    :sshex
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

    IO.puts("initiating...installing ssl")
    server = Application.get_env(:blue_potion, :server)
    project = Application.get_env(:blue_potion, :project)
    app_dir = Application.app_dir(:blue_potion)
    well_kwown_path = File.cwd!() <> "/priv/static/.well-known/"
    endpoint_ex = File.cwd!() <> "/lib/#{project.alias_name}_web/endpoint.ex"
    res = File.exists?(endpoint_ex)

    IO.inspect("#{endpoint_ex} endpoint exist? #{res}")

    if res do
      {:ok, bin} = File.read(endpoint_ex)
      new_bin = String.replace(bin, "robots.txt", "robots.txt .well-known")

      File.write(endpoint_ex, new_bin)
      File.mkdir(well_kwown_path)
    end

    prod_ex = File.cwd!() <> "/config/prod.exs"
    res = File.exists?(prod_ex)

    IO.inspect("#{prod_ex} exist? #{res}")

    if res do
      {:ok, bin} = File.read(prod_ex)

      new_bin =
        String.replace(
          bin,
          "config :logger",
          "# new host\n# end new host\nconfig :logger"
        )

      IO.puts(new_bin)
      File.write(prod_ex, new_bin)
      {:ok, bin} = File.read(prod_ex)

      new_bin =
        Regex.replace(
          ~r/# new host\n(.{0,}\n){0,}# end new host/,
          bin,
          "# new host\nconfig :#{project.alias_name}, #{project.name}Web.Endpoint,\n  url: [host: \"#{
            server.domain_name
          }\", port: 80],\n  http: [port: 80],\n  force_ssl: [hsts: true],\n  https: [\n  port: 443,\n  otp_app: :#{
            project.alias_name
          },\n  keyfile: \"/etc/letsencrypt/live/#{server.domain_name}/privkey.pem\",\n  cacertfile: \"/etc/letsencrypt/live/#{
            server.domain_name
          }/fullchain.pem\",\n  certfile: \"/etc/letsencrypt/live/#{server.domain_name}/cert.pem\"],\n  check_origin: [\"https://#{
            server.domain_name
          }\"]\n# end new host"
        )

      File.write(prod_ex, new_bin)

      {:ok, bin} = File.read(prod_ex)

      new_bin =
        String.replace(
          bin,
          "#     config :#{project.alias_name}, #{project.name}Web.Endpoint, server: true",
          "     config :#{project.alias_name}, #{project.name}Web.Endpoint, server: true"
        )

      File.write(prod_ex, new_bin)
    end

    certbot_sh = "#{app_dir}/priv/templates/certbot.sh"

    file =
      Mix.Generator.create_file(
        certbot_sh,
        EEx.eval_file("#{app_dir}/priv/templates/certbot_sh.ex",
          project: project,
          server: server
        )
      )

    result =
      Porcelain.shell(
        "sshpass -p #{server.key} scp #{certbot_sh} #{server.username}@#{server.url}:/home/#{
          server.username
        }/"
      )

    IO.puts(result.out)

    letsencrypt_ini = "#{app_dir}/priv/templates/letsencrypt.ini"

    file =
      Mix.Generator.create_file(
        letsencrypt_ini,
        EEx.eval_file("#{app_dir}/priv/templates/letsencrypt_ini.ex",
          project: project,
          server: server
        )
      )

    result =
      Porcelain.shell(
        "sshpass -p #{server.key} scp #{letsencrypt_ini} #{server.username}@#{server.url}:/home/#{
          server.username
        }/"
      )

    IO.puts(result.out)

    IO.puts("...checking server...")

    {:ok, conn2} = SSHEx.connect(ip: server.url, user: server.username, password: server.key)

    IO.puts("...authenticated...")

    case SSHEx.run(conn2, '/home/#{server.username}/certbot.sh') do
      {:ok, res, no} ->
        IO.puts(res)

      {:error, reason} ->
        IO.inspect(reason)
    end

    []
  end
end
