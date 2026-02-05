import SearchBar from "./SearchBar"

export default function Hero() {
    return (
        <section className="relative overflow-visible">

            {/* Fundo (pode manter overflow-hidden aqui se quiser) */}
            <div className="bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500">
                <div
                    className="
    mx-auto max-w-7xl px-4 text-white
    min-h-[260px] md:min-h-[300px] lg:min-h-[340px]
    flex items-center
    pt-8
    pb-20
  "
                >

                    <div className="flex items-start gap-4">
                        <span className="mt-1 text-3xl">🌟</span>
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                Bem-vindo ao nosso espaço de novidades!
                            </h1>
                            <p className="mt-3 max-w-3xl text-white/90">
                                Aqui, você acompanha em primeira mão tudo o que há de novo.
                                Consulte as últimas atualizações, descubra novos recursos e veja
                                como estamos evoluindo para atender ainda melhor às suas
                                necessidades.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra flutuando: metade dentro / metade fora */}
            <div className="absolute left-1/2 bottom-0 w-full max-w-7xl -translate-x-1/2 translate-y-1/2 px-4 z-20">
                <SearchBar />
            </div>


        </section>
    )
}
