use Distillery.Releases.Config,
    # This sets the default release built by `mix distillery.release`
    default_release: :default,
    # This sets the default environment used by `mix distillery.release`
    default_environment: Mix.env()


release <%= inspect String.to_atom(project.alias_name ) %> do
  set(
    commands: [
      migrate: "rel/commands/migrate.sh"
    ]
  )
end
