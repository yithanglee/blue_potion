defmodule <%=  project.name %>.Authorization do
  use Phoenix.Controller, namespace: <%=  project.name %>Web
  import Plug.Conn
  require IEx

  def init(opts) do
    opts
  end

  def call(conn, opts) do
    if conn.request_path |> String.contains?("/admin") do
      if conn.private.plug_session["current_user"] == nil do
        cond do
          conn.request_path |> String.contains?("/login") ->
            conn

          conn.request_path |> String.contains?("/logout") ->
            conn

          conn.request_path |> String.contains?("/authenticate") ->
            conn

          true ->
            conn
            |> put_flash(:error, "You haven't login.")
            |> redirect(to: "/admin/login")
            |> halt
        end
      else
        conn
      end
    else
      if conn.request_path |> String.contains?("/0") do
        conn
        |> put_flash(:error, "Unauthorized.")
        |> redirect(to: "/admin")
        |> halt
      else
        conn
      end
    end
  end
end