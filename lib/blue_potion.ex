defmodule BluePotion do
  require Decimal

  @moduledoc """
  Documentation for BluePotion.
  Its meant to work with phoenix form... 
  TODO: 
  api controller
  login controller
  email module?
  """

  @doc """
  jquery DataTable

  ## Examples

    if Enum.any?(conn.path_info, fn x -> x == "api" end) do
      json =
        BluePotion.post_process_datatable(params, Module.concat(["MiniAccount", "Settings", "Item"]),
          items: :stock_group
        )

      conn
      |> put_resp_content_type("application/json")
      |> send_resp(
        200,
        Jason.encode!(json)
      )
    else
      items = Settings.list_items()
      render(conn, "index.html", items: items)
    end


  """
  def post_process_datatable(params, module, preloads \\ []) do
    config = Application.get_env(:blue_potion, :repo)

    repo =
      if config == nil do
        Module.concat(["MyApp", "Repo"])
      else
        config
      end

    dynamic_code = """
      import Ecto.Query
      alias #{repo}

      limit = String.to_integer(params["length"])
      offset = String.to_integer(params["start"])
      col_key = params["columns"] |> Map.keys()

      search_queries =
        for key <- col_key do
          val = params["columns"][key]["search"]["value"]

          if val != "" do
            {String.to_atom(params["columns"][key]["data"]), val}
          end
        end
        |> Enum.reject(fn x -> x == nil end)
        |> Enum.reject(fn x -> elem(x, 1) == nil end)

    additional_search_params =
      params |> Map.drop(["_", "columns", "draw", "foo", "length", "order", "search", "start"])

    asp = additional_search_params |> Map.keys()

    search_queries2 =
      for asp_child <- asp do
        {String.to_atom(asp_child), additional_search_params |> Map.get(asp_child)}
      end

    search_queries = search_queries ++ search_queries2

    column_no = params["order"]["0"]["column"]
    key = params["columns"][column_no]["data"] |> String.to_atom()
    dir = params["order"]["0"]["dir"] |> String.to_atom()
    order_by = [{dir, key}]

    dirs =
      for ord <- params["order"] |> Map.keys() do
        key = params["columns"][params["order"][ord]["column"]]["data"] |> String.to_atom()
        dir = params["order"][ord]["dir"] |> String.to_atom()

        {dir, key}
      end

    order_by = dirs

    q1 = from(a in module)

    q1 =
      if search_queries != [] do
        q1 |> where(^search_queries)
      else
        q1
      end

    data = Repo.all(q1)

    q2 =
      from(
        a in module,
        limit: ^limit,
        offset: ^offset,
        order_by: ^order_by
      )

    q2 =
      if search_queries != [] do
        q2 |> where(^search_queries)
      else
        q2
      end

    data2 =
      Repo.all(q2)
      |> Enum.map(fn x -> BluePotion.s_to_map(x) end)

    %{
      data: data2,
      recordsTotal: Enum.count(data2),
      recordsFiltered: Enum.count(data),
      draw: String.to_integer(params["draw"])
    }

    """

    {result, _values} = Code.eval_string(dynamic_code, params: params, module: module)
    result
  end

  def string_to_atom(body, keys) do
    for key <- keys do
      cond do
        is_list(body[key]) ->
          content =
            for map <- body[key] do
              if is_map(map) do
                string_to_atom(map, Map.keys(map))
              else
                map
              end
            end

          {String.to_atom(key), content}

        true ->
          {String.to_atom(key), body[key]}
      end
    end
    |> Enum.into(%{})
  end

  def atom_to_string(body, keys) do
    for key <- keys do
      cond do
        is_list(body[key]) ->
          content =
            for map <- body[key] do
              if is_map(map) do
                string_to_atom(map, Map.keys(map))
              else
                map
              end
            end

          {Atom.to_string(key), content}

        true ->
          {Atom.to_string(key), body[key]}
      end
    end
    |> Enum.into(%{})
  end

  def map_assign_string_index(data \\ ["a", "b", "c", "d"]) do
    keys = data |> Enum.with_index() |> Enum.map(fn x -> "a#{elem(x, 1)}" |> String.to_atom() end)

    Enum.zip(keys, data) |> Enum.into(%{})
  end

  def read_file(filename) do
    check = File.exists?(File.cwd!() <> "/media")

    path =
      if check do
        File.cwd!() <> "/media"
      else
        File.mkdir(File.cwd!() <> "/media")
        File.cwd!() <> "/media"
      end

    File.read("#{path}/#{filename}")
  end

  def write_json(bin, filename) do
    check = File.exists?(File.cwd!() <> "/media")

    path =
      if check do
        File.cwd!() <> "/media"
      else
        File.mkdir(File.cwd!() <> "/media")
        File.cwd!() <> "/media"
      end

    File.rm_rf("./priv/static/images/uploads")
    File.ln_s("#{File.cwd!()}/media/", "./priv/static/images/uploads")

    File.touch("#{path}/#{filename}")

    File.write("#{path}/#{filename}", bin)
  end

  def upload_file(params) do
    check_upload =
      Map.values(params)
      |> Enum.with_index()
      |> Enum.filter(fn x -> is_map(elem(x, 0)) end)
      |> Enum.filter(fn x -> elem(x, 0).__struct__ == Plug.Upload end)

    if check_upload != [] do
      file_plug = hd(check_upload) |> elem(0)
      index = hd(check_upload) |> elem(1)

      check = File.exists?(File.cwd!() <> "/media")

      path =
        if check do
          File.cwd!() <> "/media"
        else
          File.mkdir(File.cwd!() <> "/media")
          File.cwd!() <> "/media"
        end

      final =
        if is_map(file_plug) do
          IO.inspect(is_map(file_plug))
          fl = String.replace(file_plug.filename, "'", "")
          File.cp(file_plug.path, path <> "/#{fl}")
          "/images/uploads/#{fl}"
        else
          "/images/uploads/#{file_plug}"
        end

      Map.put(params, Enum.at(Map.keys(params), index), final)
    else
      params
    end
  end

  def is_json(data) do
    if String.contains?(data, "\"") do
      case Jason.decode(data) do
        {:ok, d} ->
          if is_list(d) do
            results =
              for item <- d do
                is_map(item)
              end

            Enum.any?(results, fn x -> x == false end) == false
          else
            is_map(d)
          end

        _ ->
          false
      end
    else
      false
    end
  end

  def is_time(data_value) do
    if is_map(data_value) do
      case Map.keys(data_value) do
        [:__struct__, :calendar, :hour, :microsecond, :minute, :second] ->
          {:ok, :datetime}

        [:__struct__, :calendar, :day, :month, :year] ->
          {:ok, :date}

        _ ->
          false
      end
    else
      false
    end
  end

  def has_s(string \\ "stock_groups") do
    sanitized = String.split(string, "") |> Enum.reject(&(&1 == ""))

    first = sanitized |> Enum.reverse() |> Enum.take(1) |> List.last()

    if first == "s" do
      second = sanitized |> Enum.reverse() |> Enum.take(2) |> Enum.join("")

      if second == "se" do
        third = sanitized |> Enum.reverse() |> Enum.take(3) |> Enum.join("")

        if third == "sei" do
          String.replace(string, third, "")
        else
          # String.replace(string, second, "")
          total = Enum.count(sanitized)
          Enum.take(sanitized, total - 2) |> Enum.join()
        end
      else
        total = Enum.count(sanitized)
        Enum.take(sanitized, total - 1) |> Enum.join()

        # String.replace(string, first, "")
      end
    else
    end
  end

  def s_to_map(struct, additional_exclusion \\ []) do
    module = struct.__meta__.schema |> Module.split() |> List.last()
    exclusion = additional_exclusion ++ (test_module(module) |> Map.keys())

    a = Map.from_struct(struct)
    d = Enum.filter(a, fn x -> Decimal.is_decimal(elem(x, 1)) end)
    c = Enum.filter(a, fn x -> is_number(elem(x, 1)) end)
    b = Enum.filter(a, fn x -> is_binary(elem(x, 1)) end)
    f = Enum.filter(a, fn x -> is_bitstring(elem(x, 1)) end)
    g = Enum.filter(a, fn x -> is_float(elem(x, 1)) end)
    h = Enum.filter(a, fn x -> is_boolean(elem(x, 1)) end)
    i = Enum.filter(f, fn x -> is_json(elem(x, 1)) end)

    e =
      for item <- exclusion do
        if a[item] != nil do
          case is_time(a[item]) do
            {:ok, :datetime} ->
              hour = a[item].hour

              hour =
                if String.length(Integer.to_string(hour)) == 1 do
                  "0#{hour}"
                else
                  hour
                end

              min = a[item].minute

              min =
                if String.length(Integer.to_string(min)) == 1 do
                  "0#{min}"
                else
                  min
                end

              sec = a[item].second

              sec =
                if String.length(Integer.to_string(sec)) == 1 do
                  "0#{sec}"
                else
                  sec
                end

              {item, "#{hour}:#{min}:#{sec}"}

            {:ok, :date} ->
              {item, a[item] |> Date.to_string()}

            _ ->
              if Decimal.is_decimal(a[item]) do
                {item, a[item] |> Decimal.to_float()}
              else
                cond do
                  is_map(a[item]) ->
                    if :__meta__ in Map.keys(a[item]) do
                      final_map = Map.from_struct(a[item]) |> Map.delete(:__meta__)

                      {item, final_map}
                    else
                      {item, a[item]}
                    end

                  Timex.is_valid?(a[item]) ->
                    {item,
                     Timex.format!(Timex.shift(a[item], hours: 8), "%Y-%m-%d %H:%M:%S", :strftime)}

                  true ->
                    {item, a[item]}
                end
              end
          end
        else
          {item, a[item]}
        end
      end

    j =
      for item <- i do
        if a[elem(item, 0)] != nil do
          {elem(item, 0), Jason.decode!(a[elem(item, 0)])}
        else
          []
        end
      end

    items = a |> Enum.filter(fn x -> elem(x, 1) |> is_list end)

    # normally if its a list, inside surely have a struc?
    k =
      for item <- items do
        list = a[elem(item, 0)]

        final =
          for list_i <- list do
            Map.from_struct(list_i)
            |> Map.delete(:__meta__)
            |> Map.delete(String.to_atom(has_s(struct.__meta__.source)))
          end

        {elem(item, 0), final}
      end

    [b ++ c ++ d ++ e ++ f ++ g ++ h ++ j ++ k] |> List.flatten() |> Enum.into(%{})
  end

  def test_module(module) do
    config = Application.get_env(:blue_potion, :contexts)

    mods =
      if config == nil do
        ["Settings", "Secretary"]
      else
        config
      end

    mod =
      for mod <- mods do
        Module.concat([Application.get_env(:blue_potion, :otp_app), mod, module])
      end
      |> Enum.filter(&Code.ensure_compiled?(&1))
      |> List.first()

    fields = mod.__schema__(:fields)

    for field <- fields do
      type = mod.__schema__(:type, field)

      {field, type}
    end
    |> Enum.into(%{})
  end
end
