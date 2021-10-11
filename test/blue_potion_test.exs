defmodule BluePotionTest do
  use ExUnit.Case
  doctest BluePotion

  test "greets the world" do
    assert BluePotion.hello() == :world
  end
end
