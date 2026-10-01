"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useEvent } from "../../context/EventContext";

export default function NewEventPage() {
const router = useRouter();
const { saveEvent } = useEvent();

const [name, setName] = useState("");
const [type, setType] = useState("");
const [date, setDate] = useState("");
const [time, setTime] = useState("");
const [location, setLocation] = useState("");
const [description, setDescription] = useState("");

const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
e.preventDefault();

if (!name.trim() || !type || !date || !time || !location.trim()) {
  return;
}

saveEvent({
  name: name.trim(),
  type,
  date,
  time,
  location: location.trim(),
  description: description.trim(),
});

router.push("/events/demo");

};

const handleCancel = () => {
router.push("/dashboard");
};

return ( <main className="min-h-screen bg-zinc-50"> <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8"> <div className="mb-10"> <p className="text-sm font-semibold text-indigo-600">
EVENT STUDIO </p>

      <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900">
        Créer un événement
      </h1>

      <p className="mt-3 text-zinc-600">
        Renseignez les informations principales de votre événement.
      </p>
    </div>

    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-zinc-900"
        >
          Nom de l'événement
        </label>

        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Mariage de Jean & Marie"
          required
          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-zinc-900"
        >
          Type d'événement
        </label>

        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="" disabled>
            Sélectionnez un type
          </option>

          <option value="mariage">Mariage</option>
          <option value="anniversaire">Anniversaire</option>
          <option value="naissance">Naissance</option>
          <option value="conference">Conférence</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-zinc-900"
          >
            Date
          </label>

          <input
            id="date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="time"
            className="block text-sm font-medium text-zinc-900"
          >
            Heure
          </label>

          <input
            id="time"
            name="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-zinc-900"
        >
          Lieu
        </label>

        <input
          id="location"
          name="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ex. Salle de réception..."
          required
          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-900"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ajoutez quelques détails sur votre événement..."
          className="mt-2 w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-full border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          Annuler
        </button>

        <button
          type="submit"
          className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Créer l'événement
        </button>
      </div>
    </form>
  </div>
</main>

);
}
