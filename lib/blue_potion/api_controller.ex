defmodule BluePotion.ApiController do
    @moduledoc """
    BluePotion API Controller provides a reusable API controller for common CRUD operations.
    
    ## Usage
    
    In your controller:
    
    ```elixir
    defmodule YourAppWeb.ApiController do
      use YourAppWeb, :controller
      use BluePotion.ApiController, 
        otp_app: :your_app,
        contexts: ["Generic", "Commerce"],
        repo: YourApp.Repo
    end
    ```
    """
    

    
    defmacro __using__(opts) do
      otp_app = Keyword.fetch!(opts, :otp_app)
      contexts = Keyword.get(opts, :contexts, ["Generic", "Settings", "Secretary"])
      repo = Keyword.get(opts, :repo, Module.concat([otp_app, "Repo"]))
      
      quote do
        import BluePotion.ApiController
        
        @blue_potion_otp_app unquote(otp_app)
        @blue_potion_contexts unquote(contexts)
        @blue_potion_repo unquote(repo)
        
        # Generic API endpoints
        def get(conn, %{"scope" => scope} = params) do
          BluePotion.ApiController.handle_get(conn, scope, params, @blue_potion_otp_app, @blue_potion_contexts)
        end
        
        def post(conn, %{"scope" => scope} = params) do
          IO.inspect(params, label: "params from post in bluepotion")
          BluePotion.ApiController.handle_post(conn, scope, params, @blue_potion_otp_app, @blue_potion_contexts)
        end
        
        def put(conn, %{"scope" => scope} = params) do
          BluePotion.ApiController.handle_put(conn, scope, params, @blue_potion_otp_app, @blue_potion_contexts)
        end
        
        # CRUD endpoints
        def index(conn, %{"schema" => schema_name} = params) do
          BluePotion.ApiController.handle_index(conn, schema_name, params, @blue_potion_otp_app, @blue_potion_contexts, @blue_potion_repo)
        end
        
        def show(conn, %{"schema" => schema_name, "id" => id} = params) do
          BluePotion.ApiController.handle_show(conn, schema_name, id, params, @blue_potion_otp_app, @blue_potion_contexts)
        end
        
        def create(conn, %{"schema" => schema_name} = params) do
          BluePotion.ApiController.handle_create(conn, schema_name, params, @blue_potion_otp_app, @blue_potion_contexts)
        end
        
        def update(conn, %{"schema" => schema_name, "id" => id} = params) do
          BluePotion.ApiController.handle_update(conn, schema_name, id, params, @blue_potion_otp_app, @blue_potion_contexts)
        end
        
        def delete(conn, %{"schema" => schema_name, "id" => id}) do
          BluePotion.ApiController.handle_delete(conn, schema_name, id, @blue_potion_otp_app, @blue_potion_contexts)
        end
        
        # Default implementation of handle_custom_scope
        def handle_custom_scope(conn, scope, params, otp_app, contexts) do
          IO.inspect(scope, label: "scope in bluepotion default")
          # This should be overridden in the implementing controller
          {:error, "Custom scope '#{scope}' not implemented"}
        end
        
        # Make handle_custom_scope overridable
        defoverridable handle_custom_scope: 5

      end
    end
    
    # Handler implementations
    def handle_get(conn, scope, params, otp_app, contexts) do
      res = case scope do
        "gen_inputs" ->
          schema_name = params["schema"]
          schema = modulize_name(schema_name, otp_app, contexts)
          {:ok, BluePotion.get_schema_info(schema)}
        
        # Add more scopes as needed
        _ ->
      
          conn.private.phoenix_controller.handle_custom_scope(conn, scope, params, otp_app, contexts)
        end
      
      case res do
        {:ok, data} -> Phoenix.Controller.json(conn, %{data: data, error: nil})
        {:error, error} -> Phoenix.Controller.json(conn, %{data: nil, error: error})
      end
    end


    
    def handle_post(conn, scope, params, otp_app, contexts) do
      res = case scope do
 
        
        # Add more scopes as needed
        _ ->
          conn.private.phoenix_controller.handle_custom_scope(conn, scope, params, otp_app, contexts)
      end
      
      case res do
        {:ok, data} -> Phoenix.Controller.json(conn, %{data: data, error: nil})
        {:error, error} -> Phoenix.Controller.json(conn, %{data: nil, error: error})
      end
    end
    
    def handle_put(conn, scope, params, otp_app, contexts) do
      res = case scope do
        "update_profile" ->
          handle_update_profile(conn, params, otp_app, contexts)
        
        # Add more scopes as needed
        _ ->
          conn.private.phoenix_controller.handle_custom_scope(conn, scope, params, otp_app, contexts)
    end
      
      case res do
        {:ok, data} -> Phoenix.Controller.json(conn, %{data: data, error: nil})
        {:error, error} -> Phoenix.Controller.json(conn, %{data: nil, error: error})
      end
    end

    def handle_index(conn, schema_name, params, otp_app, contexts, repo) do
     
      with schema when not is_nil(schema) <- modulize_name(schema_name, otp_app, contexts) do
        # Extract datatable parameters with defaults
        datatable_params = %{
          "length" => params["length"] || "10",
          "start" => params["start"] || "0"
        }
        
        # Extract preloads from params
        preloads = case params["preload"] do
          nil -> []
          preloads when is_binary(preloads) -> 
            String.split(preloads, ",") |> Enum.map(&String.to_atom/1)
        end
        
        # Extract additional_joins from params
        additional_joins = case params["additional_joins"] do
          nil -> nil
          joins when is_list(joins) -> joins
          _ -> nil
        end
  
        additional_search = case params["additional_search"] do
          nil -> nil
          search when is_list(search) -> search
          _ -> nil
        end


        additional_order = case params["additional_order"] do
          nil -> nil
          order when is_list(order) -> order
          _ -> nil
        end
  
        # Build query options
        query_options = %{"preloads" => preloads}
        query_options = if additional_joins, do: Map.put(query_options, "additional_joins", additional_joins), else: query_options
        query_options = if additional_search, do: Map.put(query_options, "additional_search", additional_search), else: query_options 
        query_options = if additional_order, do: Map.put(query_options, "additional_order", additional_order), else: query_options 
        IO.inspect(query_options, label: "query_options")
        # Build query using BluePotion
        query_result = BluePotion.build_datatable_query(
          schema, 
          datatable_params, 
          query_options
        )
        
        case query_result do
          %{data: records, draw: draw, recordsTotal: total, recordsFiltered: filtered} ->
            # Generate ETag based on data content and parameters
            etag_data = %{
              records: records,
              draw: draw,
              total: total,
              filtered: filtered,
              params: params
            }
            etag = :crypto.hash(:sha256, :erlang.term_to_binary(etag_data)) |> Base.encode16(case: :lower)
            
            # Check if client has valid cached version
            if_none_match = Plug.Conn.get_req_header(conn, "if-none-match") |> List.first()
            
            if if_none_match == "\"#{etag}\"" do
              conn
              |> Plug.Conn.put_status(304)
              |> Plug.Conn.put_resp_header("etag", "\"#{etag}\"")
              |> Plug.Conn.put_resp_header("cache-control", "max-age=60")
              |> Plug.Conn.send_resp(304, "")
            else
              conn
              |> Plug.Conn.put_resp_header("etag", "\"#{etag}\"")
              |> Plug.Conn.put_resp_header("cache-control", "max-age=60")
              |> Phoenix.Controller.json(%{
                data: records |> Enum.map(&BluePotion.sanitize_struct(&1)),
                draw: draw,
                recordsTotal: total,
                recordsFiltered: filtered,
                error: nil
              })
            end
          {:error, error} ->
            conn
            |> Plug.Conn.put_resp_header("cache-control", "max-age=60")
            |> Phoenix.Controller.json(%{
              data: nil,
              error: "Query failed: #{inspect(error)}"
            })
        end
      else
        {:error, :invalid_schema} ->
          Phoenix.Controller.json(conn, %{
            data: nil,
            error: "Invalid schema: #{schema_name}"
          })
      end
    end
    
    def handle_show(conn, schema_name, id, params, otp_app, contexts) do
      with {:ok, schema} <- get_schema(schema_name, otp_app, contexts),
           record when not is_nil(record) <- BluePotion.get(schema_name, id) do
        
        record = 
          case params["preload"] do
            nil -> record
            preloads when is_binary(preloads) -> 
              preloads = String.split(preloads, ",") |> Enum.map(&String.to_atom/1)
              BluePotion.preload(record, preloads)
          end
  
        Phoenix.Controller.json(conn, %{data: record |> BluePotion.sanitize_struct, error: nil})
      else
        nil -> Phoenix.Controller.json(conn, %{data: nil, error: "Record not found"})
        {:error, :invalid_schema} -> Phoenix.Controller.json(conn, %{data: nil, error: "Invalid schema"})
      end
    end
    
    def handle_create(conn, schema_name, params, otp_app, contexts) do
      # Check if this is a list request (has length/start params) or a create request
      if Map.has_key?(params, "length") or Map.has_key?(params, "start") do
        # This is a list request with datatable parameters
        handle_index(conn, schema_name, params, otp_app, contexts, nil)
      else
        # This is a create request
        with {:ok, record} <- BluePotion.create(schema_name, params) do
          conn
          |> Plug.Conn.put_status(:created)
          |> Phoenix.Controller.json(%{data: record |> BluePotion.sanitize_struct, error: nil})
        else
          {:error, changeset} ->
            conn
            |> Plug.Conn.put_status(:unprocessable_entity)
            |> Phoenix.Controller.json(%{data: nil, error: format_errors(changeset)})
          {:error, :invalid_schema} ->
            Phoenix.Controller.json(conn, %{data: nil, error: "Invalid schema"})
        end
      end
    end
    
    def handle_update(conn, schema_name, id, params, otp_app, contexts) do
      with struct <- BluePotion.get(schema_name, id),
           {:ok, updated} <- BluePotion.update(struct, params) do
        Phoenix.Controller.json(conn, %{data: updated |> BluePotion.sanitize_struct, error: nil})
      else
        nil ->
          Phoenix.Controller.json(conn, %{data: nil, error: "Record not found"})
        {:error, changeset} ->
          conn
          |> Plug.Conn.put_status(:unprocessable_entity)
          |> Phoenix.Controller.json(%{data: nil, error: format_errors(changeset)})
        {:error, :invalid_schema} ->
          Phoenix.Controller.json(conn, %{data: nil, error: "Invalid schema"})
      end
    end
    
    def handle_delete(conn, schema_name, id, otp_app, contexts) do
      with {:ok, schema} <- get_schema(schema_name, otp_app, contexts),
           record when not is_nil(record) <- BluePotion.get(schema, id),
           {:ok, _deleted} <- BluePotion.delete(record) do
        Phoenix.Controller.json(conn, %{data: true, error: nil})
      else
        nil -> Phoenix.Controller.json(conn, %{data: nil, error: "Record not found"})
        {:error, _} -> Phoenix.Controller.json(conn, %{data: nil, error: "Could not delete record"})
        {:error, :invalid_schema} -> Phoenix.Controller.json(conn, %{data: nil, error: "Invalid schema"})
      end
    end
    
    # Helper functions
    defp modulize_name(schema, otp_app, contexts) do
      BluePotion.modulize_name(schema, otp_app, contexts)
    end
    
    defp get_schema(schema_name, otp_app, contexts) do
      schema = modulize_name(schema_name, otp_app, contexts)
      if schema, do: {:ok, schema}, else: {:error, :invalid_schema}
    end
    
    defp format_errors(changeset) do
      Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
        Enum.reduce(opts, msg, fn {key, value}, acc ->
          String.replace(acc, "%{#{key}}", to_string(value))
        end)
      end)
    end
    

    
    
    # Authentication handlers (to be overridden)
    defp handle_login(conn, params, otp_app, contexts) do
      # This should be overridden in the implementing controller
      {:error, "Login not implemented"}
    end
    
    defp handle_register(conn, params, otp_app, contexts) do
      # This should be overridden in the implementing controller
      {:error, "Register not implemented"}
    end
    
    defp handle_update_profile(conn, params, otp_app, contexts) do
      # This should be overridden in the implementing controller
      {:error, "Update profile not implemented"}
    end
  end