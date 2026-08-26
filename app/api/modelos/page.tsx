async function handleDelete(id: number) {
    if (!confirm("Tem a certeza absoluta de que pretende eliminar este modelo?")) return;

    try {
      const response = await fetch(`/api/modelos`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      
      if (!response.ok) throw new Error("Erro ao eliminar o modelo.");
      await carregarDados();
    } catch (error) {
      alert("Não foi possível eliminar o modelo.");
    }
  }