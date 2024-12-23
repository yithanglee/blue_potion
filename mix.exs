defmodule BluePotion.MixProject do
  use Mix.Project

  def project do
    [
      app: :blue_potion,
      version: "0.1.7",
      elixir: "~> 1.9",
      start_permanent: Mix.env() == :prod,
      description: description,
      deps: deps()
    ]
  end

  defp description do
    """
    Library to provide additional utility for bootstrap based web app.
    """
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger, :sshex]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:sshex, "2.2.1"},
      {:porcelain, "~> 2.0"},
      {:jason, "~> 1.0"}
      # {:dep_from_hexpm, "~> 0.3.0"},
      # {:dep_from_git, git: "https://github.com/elixir-lang/my_dep.git", tag: "0.1.0"}
    ]
  end
end
