const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/ping", (req, res) => res.json({ ok: true }));

app.post("/api/check", async (req, res) => {
  const { process } = req.body;

  if (!process) return res.status(400).json({ error: "Processo não informado" });

  try {
    const url = "https://transparencia.tce.sp.gov.br/api/json/despesas/colina/2025/9";
    const response = await axios.get(url);

    // Buscar todos os registros que contenham o número do empenho ou nome do fornecedor
    const encontrados = response.data.filter(d => 
      (d.nr_empenho && d.nr_empenho.toLowerCase().includes(process.toLowerCase())) ||
      (d.nm_fornecedor && d.nm_fornecedor.toLowerCase().includes(process.toLowerCase()))
    );

    if (encontrados.length > 0) {
      // Mapear todos os resultados encontrados
      const resultados = encontrados.map(d => ({
  orgao: d.orgao,
  mes: d.mes,
  evento: d.evento,
  nr_empenho: d.nr_empenho,           // número do empenho
  fornecedor: d.nm_fornecedor,         // nome do fornecedor
  id_fornecedor: d.id_fornecedor,      // id do fornecedor
  data_emissao: d.dt_emissao_despesa,  // data de emissão
  valor: d.vl_despesa                  // valor da despesa
}));

      return res.json({
        status: "PAGO",
        processo: process,
        achado: true,
        resultados
      });
    } else {
      return res.json({
        status: "NÃO ENCONTRADO",
        processo: process,
        achado: false,
        resultados: []
      });
    }

  } catch (error) {
    console.error("❌ Erro ao consultar API:", error.message);
    return res.status(500).json({ error: "Erro servidor", detalhe: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
