defmodule <%=  project.name %>Web.LoginController do
  use <%=  project.name %>Web, :controller
  import Ecto.Query
  alias <%=  project.name %>.{Settings, Repo}
  
  def index(conn, params) do
     render(conn, "login.html", layout: {<%=  project.name %>Web.LayoutView, "login.html"})
  end

  def authenticate(conn,params) do
    if check_password(params) do
      users = Repo.all(from u in Settings.User, where: u.username == ^params["username"])
      user = List.first(users)

      conn
      |> put_session(:current_user, Utility.s_to_map(user))
      |> put_flash(:info, "Welcome!")
      |> redirect(to: "/admin")
    else
      conn
      |> put_flash(:info, "Denied!")
      |> redirect(to: "/admin/login")
    end
  end

  def logout(conn,params) do
    conn
    |> delete_session(:current_user)
    |> put_flash(:info, "Logout!")
    |> redirect(to: "/admin/login")
  end

  def check_password(params) do
    # your auth method here


    # sample reference
    users = Repo.all(from u in Settings.User, where: u.username == ^params["username"])
    if users != [] do
      user = List.first(users)
      crypted_password =
      :crypto.hash(:sha512, params["password"]) |> Base.encode16() |> String.downcase()
      crypted_password == user.crypted_password 
    else
      false
    end

  end
end
