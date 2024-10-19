import express from "express";
import axios from "axios";
import { promises as fs} from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const port = 3000;

const URL_BASE = "https://pokeapi.co/api/v2/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get("/pokemons/add", async (req, res) => {
  const idPokemon = req.query.id_pokemon;

  try {
    const contentFile = await fs.readFile(
      `${__dirname}/files/pokemones.txt`,
      "utf-8"
    );
    const contentJson = JSON.parse(contentFile);

    const { data } = await axios.get(`${URL_BASE}/pokemon/${idPokemon}`);
    const pokemon = {
      id: data.id,
      nombre: data.name,
      imagen: data.sprites.other.dream_world.front_default,
      tipo: data.types[0].type.name,
      experiencia: data.base_experience,
    };
    const busqueda = contentJson.find((item) => item.id === pokemon.id);
    if (busqueda) {
      return res
        .status(409)
        .json({ message: "Personaje registrado previamente" });
    }
    contentJson.push(pokemon);
    await fs.writeFile(
      `${__dirname}/files/pokemones.txt`,
      JSON.stringify(contentJson),
      "utf-8"
    );
    res.json({ message: "Pokemón registrado con éxito", data: contentJson });
  } catch (err) {
    res.status(500).json({ message: "Hubo un error interno" });
  }
});

app.get("/pokemons/list", async (req, res) => {
  try {
    const listaPokemonText = await fs.readFile(`${__dirname}/files/pokemones.txt`,"utf-8");
    const listaPokemonJson = JSON.parse(listaPokemonText)
    const listaOrdenada = [ ...listaPokemonJson].sort((a, b) => Number(a.id) - Number(b.id))
    console.table(listaOrdenada)
    res.json({ message: "Lista de pokemones registrados exitosamente", lista: listaOrdenada })
  } catch (err) {
    console.log(err)
  }
});

app.get("/pokemons/details", async (req, res) => {
    const idPokemonDetail = req.query.id_pokemon
    try {
        const listaPokemonesTxt = await fs.readFile(`${__dirname}/files/pokemones.txt`, "utf-8")
        const listaPokemonesJs = JSON.parse(listaPokemonesTxt)

        const pokemonEncontrado = listaPokemonesJs.find( item => item.id === Number(idPokemonDetail))
        if(pokemonEncontrado) return res.json({ message: "Pokemón encontrado", pokemon: pokemonEncontrado })

        res.json({ message: "Tú pokemón no ha sido encontrado" })
    
    } catch(err) {
        console.log(err)
    }
})

app.listen(port, () => console.log(`Servidor escuchando en el puerto ${port}`));
