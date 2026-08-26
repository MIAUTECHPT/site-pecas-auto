async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeModelo.trim() || !brandIdSelecionada) {
      setErro("Seleciona uma marca e escreve o nome do modelo.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const res = await fetch("/api/modelos/adicionar", { // <--- Confirma se está /adicionar aqui
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nomeModelo,
          brandId: Number(brandIdSelecionada),
        }),
      });

      const textResponse = await res.text();
      let data;
      try {
        data = textResponse ? JSON.parse(textResponse) : {};
      } catch (e) {
        throw new Error(`Erro do servidor (${res.status}): ${textResponse || "Resposta vazia"}`);
      }

      if (!res.ok) {
        throw new Error(data.error || `Erro ao criar modelo (Status ${res.status})`);
      }

      setNomeModelo("");
      setBrandIdSelecionada("");
      await carregarDados();
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }