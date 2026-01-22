import "dotenv/config"
import { prisma } from "../lib/prisma"
import { encrypt } from "../lib/crypto/encrypt"

const dados = [
  {
    "Nome do colaborador": "Airam Victoria Taschner",
    "Usuário": "airam",
    "Departamento": "FIN",
    "Senha": "*At945353",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Ana Beatriz Almeida dos Santos",
    "Usuário": "anabeatriz",
    "Departamento": "IMP",
    "Senha": "*At853962",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Adrian Alexander",
    "Usuário": "adrian",
    "Departamento": "IMP",
    "Senha": "*At529048",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "André Fernandes de Moraes",
    "Usuário": "andrefernandes",
    "Departamento": "FIN",
    "Senha": "*At875301",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Amanda Muchiuti Pereira",
    "Usuário": "amanda",
    "Departamento": "-",
    "Senha": "*At397561",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Ana Caroline Do Nascimento",
    "Usuário": "ana",
    "Departamento": "IMP",
    "Senha": "*at918873",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Ana Cristina Laurentino",
    "Usuário": "anacristina",
    "Departamento": "RH",
    "Senha": "*At519483",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Anna Luiza dos Anjos Teixeira Thome Simoni",
    "Usuário": "annasimoni",
    "Departamento": "IMP",
    "Senha": "*At298763",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Arthur Porto",
    "Usuário": "arthurporto",
    "Departamento": "IMP",
    "Senha": "*At593621",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Ana Paula Vogel",
    "Usuário": "anavogel",
    "Departamento": "IMP",
    "Senha": "*At163509",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Catarine Biazussi",
    "Usuário": "catarine",
    "Departamento": "FIN",
    "Senha": "*At745061",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Claudiane Lucano",
    "Usuário": "claudiane",
    "Departamento": "IMPO",
    "Senha": "*At155824",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Évelyn Castellani dos Santos",
    "Usuário": "evelyncastellani",
    "Departamento": "PRE-EMB",
    "Senha": "*At914758",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Enzo Pereira Teixeira",
    "Usuário": "enzopereira",
    "Departamento": "APOEMA",
    "Senha": "*At245896",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Enrique Dantras Pessoa Mendieta",
    "Usuário": "enrique",
    "Departamento": "PRE-EMB",
    "Senha": "*At654391",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Eduardo Luis Balduino",
    "Usuário": "eduardoluis",
    "Departamento": "IMPO",
    "Senha": "*At716875",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Erick Whither Silva Sousa",
    "Usuário": "erick",
    "Departamento": "EXPO",
    "Senha": "*At967822",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Fabricio dos Santos",
    "Usuário": "fabriciosantos",
    "Departamento": "IMP",
    "Senha": "*At237461",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Gabriel Bier Viccari",
    "Usuário": "gabrielbier",
    "Departamento": "IMP",
    "Senha": "*At334780",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Gabriel Henrique dos Santos Pereira",
    "Usuário": "gabrielhenrique",
    "Departamento": "IMP",
    "Senha": "*At915847",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Gabriel Martins",
    "Usuário": "gabrielmartins",
    "Departamento": "IMP",
    "Senha": "*At462597",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Gilberto Moreira Do Nascimento",
    "Usuário": "gilberto",
    "Departamento": "COM",
    "Senha": "*at468498",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Gregory Baron Caetano",
    "Usuário": "gregory",
    "Departamento": "IMP",
    "Senha": "*At562891",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Gustavo Henrique Vieira",
    "Usuário": "gustavohenrique",
    "Departamento": "FIN",
    "Senha": "*At432738",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Guilherme Alfonsin Timm",
    "Usuário": "guilhermealfonsin",
    "Departamento": "IMP",
    "Senha": "*At784012",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Guilherme de Almeida Galarza",
    "Usuário": "guilhermealmeida",
    "Departamento": "IMP",
    "Senha": "*At652584",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Heloisa Barbosa",
    "Usuário": "heloisa",
    "Departamento": "APOEMA",
    "Senha": "*At180659",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Isadora Machado",
    "Usuário": "isadora",
    "Departamento": "JURIDICO",
    "Senha": "*At820005",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Kamilla Haerter Harthopf",
    "Usuário": "kamilla",
    "Departamento": "IMP",
    "Senha": "*At542369",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Jamilly Moreira da Costa",
    "Usuário": "jamilly",
    "Departamento": "IMP",
    "Senha": "*At260817",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "João Inácio Acosta dos Santos",
    "Usuário": "joaoinacio",
    "Departamento": "IMP",
    "Senha": "*At504732",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "João Pedro Martinhago",
    "Usuário": "joaopedro/ narwal - joaomartinhago",
    "Departamento": "IMP",
    "Senha": "*At874365",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Karen Luana Garcia Manjor",
    "Usuário": "karen",
    "Departamento": "EXPO",
    "Senha": "*at757334",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Kethellen Fernandes Chaves",
    "Usuário": "kethellen",
    "Departamento": "IMPO",
    "Senha": null,
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Recepção Itajaí - Fabiana Piccinalli",
    "Usuário": "recepcao/recepcaoitj",
    "Departamento": "RECEPÇÃO",
    "Senha": "*At157246",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Kedma Muchiuti Pereira",
    "Usuário": "kedma",
    "Departamento": "DIRETORIA",
    "Senha": "PC *At119701/*at923642/*At961583",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Laura Castro Milani",
    "Usuário": "laura",
    "Departamento": "IMP",
    "Senha": "*At290742",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Leandro Milani",
    "Usuário": "leandromilani",
    "Departamento": "MKT",
    "Senha": "*at842653",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Lair Mateus Rodrigues Hahn",
    "Usuário": "lairmateus",
    "Departamento": "TI",
    "Senha": "*At357126",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Laís Gabriela Moreira Alflen",
    "Usuário": "laisgabriela",
    "Departamento": "TI",
    "Senha": "*At625984",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Leonardo Antonio De Medeiros",
    "Usuário": "leonardoantonio",
    "Departamento": "FIN",
    "Senha": "*At739538",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Luis Felipe Luchtemberg",
    "Usuário": "luis",
    "Departamento": "APOEMA",
    "Senha": "*At688429",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Maria Eduarda Gomes Cardozo",
    "Usuário": "mariacardozo",
    "Departamento": "IMP",
    "Senha": "*At519354",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Marcus Vinicius De Oliveira Maia",
    "Usuário": "marcus",
    "Departamento": "IMP",
    "Senha": "*At109238",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Matheus Davi Cardoso",
    "Usuário": "matheusdavi",
    "Departamento": "FIN",
    "Senha": "*At625984",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Matheus Henrique da Silva",
    "Usuário": "matheushenrique",
    "Departamento": "IMP",
    "Senha": "*At133836",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Matheus Jose Muchiuti Pereira",
    "Usuário": "matheuspereira",
    "Departamento": "ADM",
    "Senha": "*At961583",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Michael Irvine Duarte",
    "Usuário": "michael",
    "Departamento": "TI",
    "Senha": "*At172482",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Natan Camillo Berti Da Silva",
    "Usuário": "natan",
    "Departamento": "APOEMA",
    "Senha": "*At071215",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Nathalia Rodrigues Nortt",
    "Usuário": "nathalia",
    "Departamento": "FIN",
    "Senha": "*At214214",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Ronildo Alves De Sousa",
    "Usuário": "ronildo",
    "Departamento": "EXT",
    "Senha": "*at438730",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Taina Cristina Rodrigues",
    "Usuário": "taina",
    "Departamento": "COM",
    "Senha": "*At372594",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Thiago Augusto Martins",
    "Usuário": "thiagoaugusto",
    "Departamento": "EXPO",
    "Senha": "*At236521",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Vinicius Gonçalves Pereira",
    "Usuário": "vinicius",
    "Departamento": "IMP",
    "Senha": "*At859836",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Vinicius Rodrigues Fan",
    "Usuário": "viniciusfan",
    "Departamento": "PRE-EMB",
    "Senha": "*At876321",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Kamilla Haerter Harthopf",
    "Usuário": "kamilla",
    "Departamento": "IMP",
    "Senha": "*At542369",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Yuri da Silva",
    "Usuário": "yurisilva",
    "Departamento": "PRE-EMB",
    "Senha": "*At124068",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Lucas de Jesus Seta da Silva",
    "Usuário": "lucasseta",
    "Departamento": "IMP",
    "Senha": "*At173005",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Financeiro ITJ",
    "Usuário": "financeiroitj",
    "Departamento": "FINAN",
    "Senha": "*At391285",
    "Status": "ATIVO"
  },
  {
    "Nome do colaborador": "Ana Luiza Borges",
    "Usuário": "analuiza/anaborges",
    "Departamento": "TEMPORÁRIO",
    "Senha": "*At783621",
    "Status": "ATIVO"
  }
]

async function importarAcessos() {
  try {
    console.log("🚀 Iniciando importação de acessos...")

    // Buscar um usuário admin para ser o registradoPor
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    })

    if (!adminUser) {
      throw new Error("Nenhum usuário admin encontrado. É necessário ter pelo menos um admin no banco.")
    }

    console.log(`✅ Usando admin: ${adminUser.name} (${adminUser.email})`)

    // ID da categoria Itajai existente no banco
    const categoriaItajaiId = "c77a4519-8e25-4965-885e-87c502212f17"
    
    // Verificar se a categoria existe
    const categoriaItajai = await prisma.categoriaColaborador.findUnique({
      where: { id: categoriaItajaiId },
    })

    if (!categoriaItajai) {
      throw new Error(`Categoria com ID ${categoriaItajaiId} não encontrada. Verifique se a categoria "Itajai" existe no banco.`)
    }

    console.log(`✅ Usando categoria: ${categoriaItajai.nome} (${categoriaItajai.id})`)

    let sucessos = 0
    let erros = 0
    const errosDetalhes: string[] = []

    for (const item of dados) {
      try {
        const nome = item["Nome do colaborador"].trim()
        const usuario = item["Usuário"]?.trim() || null
        const departamento = item["Departamento"]?.trim()
        const departamentoFinal = departamento && departamento !== "-" ? departamento : null
        const senhaRaw = item["Senha"]
        const ativo = item["Status"] === "ATIVO"

        // Processar senha
        let senhaFinal: string | null = null
        if (senhaRaw) {
          // Se tiver múltiplas senhas separadas por /, pegar a primeira
          const senhaProcessada = senhaRaw.split("/")[0].trim()
          // Remover prefixos como "PC " se existirem
          const senhaLimpa = senhaProcessada.replace(/^PC\s+/i, "").trim()
          if (senhaLimpa) {
            senhaFinal = encrypt(senhaLimpa)
          }
        }

        // Verificar se já existe um acesso com o mesmo nome ou usuário
        const existe = await prisma.colaboradorExterno.findFirst({
          where: {
            OR: [
              { nome: nome },
              ...(usuario ? [{ usuario: usuario }] : []),
            ],
          },
        })

        if (existe) {
          console.log(`⏭️  Pulando ${nome} - já existe no banco`)
          continue
        }

        await prisma.colaboradorExterno.create({
          data: {
            nome,
            usuario,
            email: null,
            senha: senhaFinal,
            departamento: departamentoFinal,
            categoriaId: categoriaItajaiId,
            registradoPorId: adminUser.id,
            ativo,
          },
        })

        sucessos++
        console.log(`✅ ${sucessos}. ${nome} - ${usuario || "sem usuário"}`)
      } catch (error: any) {
        erros++
        const erroMsg = `❌ Erro ao importar ${item["Nome do colaborador"]}: ${error.message}`
        errosDetalhes.push(erroMsg)
        console.error(erroMsg)
      }
    }

    console.log("\n" + "=".repeat(50))
    console.log(`✅ Importação concluída!`)
    console.log(`   Sucessos: ${sucessos}`)
    console.log(`   Erros: ${erros}`)
    if (errosDetalhes.length > 0) {
      console.log("\n📋 Detalhes dos erros:")
      errosDetalhes.forEach((erro) => console.log(`   ${erro}`))
    }
  } catch (error: any) {
    console.error("❌ Erro fatal:", error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importarAcessos()
