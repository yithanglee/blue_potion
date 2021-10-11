defmodule <%=  project.name %>Web.LandingPageController do
  use <%=  project.name %>Web, :controller
  import Ecto.Query
  alias <%=  project.name %>.{Settings, Repo}
  
  def index(conn, params) do
     render(conn, "index.html", layout: {<%=  project.name %>Web.LayoutView, "frontend.html"})
  end


end
