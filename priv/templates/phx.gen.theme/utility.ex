defmodule Utility do
  require Decimal

  def raw_sql(query, assignments \\ []) do
    case Ecto.Adapters.SQL.query!(<%= project.name  %>.Repo, query, assignments) do
      %Postgrex.Result{
        columns: columns,
        command: command,
        connection_id: _id,
        messages: messages,
        num_rows: num_rows,
        rows: rows
      } ->
        %{columns: columns, rows: rows}

      _ ->
        %{columns: [], rows: []}
    end
  end
  
  def map_assign_string_index(data \\ ["a", "b", "c", "d"]) do
    keys = data |> Enum.with_index() |> Enum.map(fn x -> "a#{elem(x, 1)}" |> String.to_atom() end)

    Enum.zip(keys, data) |> Enum.into(%{})
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

  def s_to_map(struct, exclusion \\ []) do
    module = struct.__meta__.schema |> Module.split() |> List.last()
    exclusion = test_module(module) |> Map.keys()
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
                if Timex.is_valid?(a[item]) do
                  {item,
                   Timex.format!(Timex.shift(a[item], hours: 0), "%Y-%m-%d %H:%M:%S", :strftime)}
                else
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

    [b ++ c ++ d ++ e ++ f ++ g ++ h ++ j] |> List.flatten() |> Enum.into(%{})
  end

  def test_module(module) do
    mod = Module.concat([<%= inspect project.name  %>, "Settings", module])
  fields =  mod.__schema__(:fields)
    
    for field <- fields do
      type = mod.__schema__(:type, field)

      {field, type}
    end
    |> Enum.into(%{})
  end
end
