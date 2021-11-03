defmodule Mix.Tasks.Phx.Gen.Theme do
  use Mix.Task

  @start_apps [
    :porcelain
  ]

  @shortdoc "Import controllers"

  @moduledoc """

  """

  @doc false
  def run(args) do
    # Application.put_env(:phoenix, :serve_endpoints, true, persistent: true)
    # Mix.Tasks.Run.run(run_args() ++ args)

    run_args()
  end

  def material_login(app_dir, project) do
    # login controller 
    Mix.Generator.create_file(
      File.cwd!() <> "/lib//#{project.alias_name}_web/controllers/login_controller.ex",
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/login_controller.ex",
        project: project
      )
    )

    # login view
    material_loginview_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/views" <> "/login_view.ex"

    Mix.Generator.create_file(
      material_loginview_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/login_view.ex", project: project)
    )

    # login template
    material_login_html_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/login" <> "/login.html.eex"

    Mix.Generator.create_file(
      material_login_html_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/login.html.eex", project: project)
    )

    # bring over all the needed files with bundled js.. ?
    # firstly build the admin backend...  

    # login layout with form inside
    material_login_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/layout" <> "/login.html.eex"

    # Mix.Generator.create_file(
    #   material_login_ex,
    #   EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/layout_login.html.eex",
    #     project: project
    #   )
    # )

    File.cp!("#{app_dir}/priv/templates/phx.gen.theme/layout_login.html.eex", material_login_ex)

    bootstrap_app_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/layout" <> "/app.html.eex"

    File.cp!("#{app_dir}/priv/templates/phx.gen.theme/layout_app.html.eex", bootstrap_app_ex)

    bootstrap_header_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/layout" <> "/header.html.eex"

    File.cp!(
      "#{app_dir}/priv/templates/phx.gen.theme/layout_header.html.eex",
      bootstrap_header_ex
    )

    # copy all the static files over...
    File.cp_r!("#{app_dir}/priv/assets", File.cwd!() <> "/priv/static/")
  end

  defp run_args() do
    Enum.each(@start_apps, &Application.ensure_all_started/1)
    IO.puts("importing Material Dashboard")

    server = Application.get_env(:blue_potion, :server)
    project = Application.get_env(:blue_potion, :project)
    app_dir = Application.app_dir(:blue_potion)

    material_login(app_dir, project)

    Mix.Generator.create_file(
      File.cwd!() <> "/lib//#{project.alias_name}_web/controllers/api_controller.ex",
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/api_controller.ex", project: project)
    )

    authorization_ex = File.cwd!() <> "/lib/#{project.alias_name}/authorization.ex"

    Mix.Generator.create_file(
      authorization_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/authorization.ex", project: project)
    )

    ~s(\r\n\r\nPlease put the following plug to your browser pipeline.\r\n\r\n\t   plug\(#{
      project.name
    }.Authorization\)\r\n)
    |> IO.puts()

    ~s(\r\n\r\nPlease put the following routes to your router.ex\r\n\r\n\tscope \"/admin\", #{
      project.name
    }Web do\r\n\t  pipe_through \:browser\r\n\t  get\(\"/login\", LoginController, :index\)\r\n\t  post\(\"/authenticate\", LoginController, :authenticate\)\r\n\t  get\(\"/logout\", LoginController, :logout\)\r\n\tend\r\n)
    |> IO.puts()

    ~s(\r\n\tscope \"/\", #{project.name}Web do\r\n\t  pipe_through \:browser\r\n\t  get\(\"/\", LandingPageController, :index\)\r\n\tend\r\n\r\n)
    |> IO.puts()

    ~s(\r\n\tscope \"/api\", #{project.name}Web do\r\n\t  pipe_through \:api\r\n\t  get\(\"/webhook\", ApiController, :webhook\)\r\n\t  post\(\"/webhook\", ApiController, :webhook_post\)\r\n\t  delete\(\"/webhook\", ApiController, :webhook_delete\)\r\n\tend\r\n\r\n)
    |> IO.puts()

    []
  end
end
