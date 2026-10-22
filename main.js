/**
 * Função auxiliar: Rotação circular de 32 bits para a esquerda (Rotate Left - ROL)
 * Desloca os bits para a esquerda e faz os bits que "caíram" voltarem pela direita.
 */
function rotacaoEsquerda32(valor, deslocamento) {
  return ((valor << deslocamento) | (valor >>> (32 - deslocamento))) >>> 0;
}

/**
 * Abordagem 1: Hash simples utilizando SOMENTE XOR bloco a bloco (blocos de 4 bytes / 32 bits)
 */
function hashXorBlocoABloco(mensagem) {
  // 1. Converter a string para um array de bytes (valores ASCII/UTF-8)
  const bytes = Array.from(Buffer.from(mensagem, "utf-8"));

  // 2. Padding simples: preencher com zeros até que o tamanho seja múltiplo de 4 bytes (32 bits)
  while (bytes.length % 4 !== 0 || bytes.length === 0) {
    bytes.push(0);
  }

  let hashEstado = 0x00000000; // Estado inicial de 32 bits zerado

  // 3. Percorrer de 4 em 4 bytes (1 bloco de 32 bits por vez) e aplicar XOR
  for (let i = 0; i < bytes.length; i += 4) {
    const bloco32Bits =
      ((bytes[i] << 24) |
        (bytes[i + 1] << 16) |
        (bytes[i + 2] << 8) |
        bytes[i + 3]) >>>
      0;

    // Aplica o XOR bloco a bloco
    hashEstado = (hashEstado ^ bloco32Bits) >>> 0;
  }

  // Retorna o resultado em formato Hexadecimal de 8 dígitos (32 bits)
  return hashEstado.toString(16).padStart(8, "0");
}

/**
 * Abordagem 2: Hash simples utilizando XOR + Rotação de Bits (Mais robusto)
 * Resolve o problema de blocos iguais se anularem no XOR puro.
 */
function hashXorComRotacao(mensagem) {
  const bytes = Array.from(Buffer.from(mensagem, "utf-8"));
  const tamanhoOriginal = bytes.length;

  // Padding simples adicionando um byte terminador (0x80) e zeros até fechar múltiplo de 4
  bytes.push(0x80);
  while (bytes.length % 4 !== 0) {
    bytes.push(0);
  }

  // Valor inicial (Semente / IV simples de 32 bits)
  let hashEstado = 0x811c9dc5;

  for (let i = 0; i < bytes.length; i += 4) {
    // Monta o bloco de 32 bits a partir de 4 caracteres/bytes
    const bloco =
      ((bytes[i] << 24) |
        (bytes[i + 1] << 16) |
        (bytes[i + 2] << 8) |
        bytes[i + 3]) >>>
      0;

    // 1º Passo: Faz o XOR do estado atual com o bloco lido
    hashEstado = (hashEstado ^ bloco) >>> 0;

    // 2º Passo: Rotaciona os bits em 7 posições para a esquerda para espalhar os bits
    hashEstado = rotacaoEsquerda32(hashEstado, 7);

    // 3º Passo: Faz um novo XOR com o índice do bloco e o tamanho original da mensagem
    hashEstado = (hashEstado ^ (i + tamanhoOriginal)) >>> 0;
  }

  return hashEstado.toString(16).padStart(8, "0");
}

// ==========================================
// TESTES PRÁTICOS PARA DEMONSTRAÇÃO
// ==========================================

const entradasTeste = [
  "SegurancaDaInformacao",
  "SegurancaDaInformacan", // Apenas 1 letra diferente no final
  "ABCD1234ABCD1234", // Dois blocos de 4 bytes repetidos
  "1234ABCD", // Ordem dos blocos invertida
];

console.log("=== COMPARAÇÃO DOS ALGORITMOS DE HASH (32 BITS / HEX) ===\n");

for (const texto of entradasTeste) {
  const hXorPuro = hashXorBlocoABloco(texto);
  const hXorRot = hashXorComRotacao(texto);

  console.log(`Entrada: "${texto}"`);
  console.log(`  -> XOR Bloco a Bloco : ${hXorPuro}`);
  console.log(`  -> XOR com Rotação   : ${hXorRot}\n`);
}
