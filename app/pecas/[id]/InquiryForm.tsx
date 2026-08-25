"use client";

import { FormEvent, useState } from "react";

type InquiryFormProps = {
  partId: number;
  partName: string;
  reference: string;
};

export default function InquiryForm({
  partId,
  partName,
  reference,
}: InquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Olá! Gostaria de obter informações sobre a peça ${partName} (ref. ${reference}).`
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          partId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível enviar o pedido."
        );
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage(
        `Olá! Gostaria de obter informações sobre a peça ${partName} (ref. ${reference}).`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao enviar o pedido."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label className="mb-2 block text-sm font-bold text-zinc-700">
          Nome
        </label>

        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          placeholder="O seu nome"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-zinc-700">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="o-seu@email.pt"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-zinc-700">
          Telefone
        </label>

        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="912 345 678"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-zinc-700">
          Mensagem
        </label>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          rows={5}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
          Pedido enviado com sucesso. Entraremos em contacto consigo.
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "A enviar..." : "Enviar pedido de informação"}
      </button>
    </form>
  );
}