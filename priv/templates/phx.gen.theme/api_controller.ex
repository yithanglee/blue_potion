defmodule <%=  project.name %>Web.ApiController do
  use <%=  project.name %>Web, :controller

  def webhook(conn, params) do
    final =
      case params["scope"] do
        "gen_inputs" ->
          Utility.test_module(params["module"])

        _ ->
          %{status: "received"}
      end

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(final))
  end
end
