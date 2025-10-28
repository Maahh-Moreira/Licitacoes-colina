const btnBuscar = document.getElementById('buscar');
const resultado = document.getElementById('resultado');

btnBuscar.addEventListener('click', buscarDespesas);

async function buscarDespesas() {
  const numero = document.getElementById('empenho').value.trim();
  const evento = document.getElementById('evento').value.trim();
  const mes = document.getElementById('mes').value.trim();

  if (!numero) {
    resultado.innerHTML = "<p class='muted'>⚠️ Digite o número do empenho.</p>";
    return;
  }

  resultado.innerHTML = "<p class='muted'>🔍 Consultando registros do TCE-SP (Colina)...</p>";

  try {
    const resp = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero, evento, mes })
    });

    if (!resp.ok) throw new Error("Erro de servidor");
    const json = await resp.json();

    if (!json.achado) {
      resultado.innerHTML = `<div class="inconcl card">
        <strong>❌ Nenhum registro encontrado</strong>
        <div class="small">Verifique o número e tente novamente.</div>
      </div>`;
      return;
    }

   resultado.innerHTML = json.resultados.map(item => {
  let classe = "inconcl";
  if (/pago/i.test(item.evento)) classe = "pago";
  else if (/anula/i.test(item.evento)) classe = "nao";

  return `
    <div class="card ${classe}">
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

      <details>
        <summary class="small">Ver JSON completo</summary>
        <pre class="raw">${JSON.stringify(item, null, 2)}</pre>
      </details>
    </div>`;
}).join("");


  } catch (err) {
    resultado.innerHTML = `<div class="nao card"><strong>Erro:</strong> ${err.message}</div>`;
  }
}
