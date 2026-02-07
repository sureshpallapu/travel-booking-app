import araku from "../assets/places/araku.jpg";
import chikmagalur from "../assets/places/chikmagalur.jpg";
import coorg from "../assets/places/coorg.jpg";
import gokarna from "../assets/places/gokarna.jpg";
import hampi from "../assets/places/hampi.jpg";
import jogfalls from "../assets/places/jogfalls.jpg";
import kabini from "../assets/places/kabini.jpg";
import mysuru from "../assets/places/mysuru.jpg";
import tirupati from "../assets/places/tirupati.jpg";
import vizag from "../assets/places/vizag.jpg";

const places = [
  /* ===== KARNATAKA ===== */
  {
    id: 1,
    name: "Coorg",
    state: "Karnataka",
    duration: "3 Days / 2 Nights",
    price: 12000,
    journey: "Bangalore → Coorg (Bus / Car)",
    image: coorg,
  },
  {
    id: 2,
    name: "Hampi",
    state: "Karnataka",
    duration: "2 Days / 1 Night",
    price: 8500,
    journey: "Bangalore → Hampi (Train)",
    image: hampi,
  },
  {
    id: 3,
    name: "Chikmagalur",
    state: "Karnataka",
    duration: "3 Days / 2 Nights",
    price: 11000,
    journey: "Bangalore → Chikmagalur (Car)",
    image: chikmagalur,
  },
  {
    id: 4,
    name: "Gokarna",
    state: "Karnataka",
    duration: "2 Days / 1 Night",
    price: 9000,
    journey: "Bangalore → Gokarna (Bus)",
    image: gokarna,
  },
  {
    id: 5,
    name: "Mysuru",
    state: "Karnataka",
    duration: "2 Days / 1 Night",
    price: 6500,
    journey: "Bangalore → Mysuru (Train)",
    image: mysuru,
  },
  {
    id: 6,
    name: "Jog Falls",
    state: "Karnataka",
    duration: "2 Days / 1 Night",
    price: 7500,
    journey: "Shivamogga → Jog Falls (Car)",
    image: jogfalls,
  },
  {
    id: 7,
    name: "Kabini",
    state: "Karnataka",
    duration: "2 Days / 1 Night",
    price: 9500,
    journey: "Mysuru → Kabini (Car)",
    image: kabini,
  },

  /* ===== ANDHRA PRADESH ===== */
  {
    id: 8,
    name: "Araku Valley",
    state: "Andhra Pradesh",
    duration: "3 Days / 2 Nights",
    price: 10000,
    journey: "Visakhapatnam → Araku (Train)",
    image: araku,
  },
  {
    id: 9,
    name: "Tirupati",
    state: "Andhra Pradesh",
    duration: "2 Days / 1 Night",
    price: 6000,
    journey: "Chennai → Tirupati (Bus)",
    image: tirupati,
  },
  {
    id: 10,
    name: "Visakhapatnam",
    state: "Andhra Pradesh",
    duration: "3 Days / 2 Nights",
    price: 11500,
    journey: "Hyderabad → Vizag (Train)",
    image: vizag,
  },
];

export default places;
