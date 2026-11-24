import { Link } from "react-router-dom";

function Home() {

    const categories = [
        {
            name: "TREKKING",
            description: "Gear up for the unknown.",
            image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800"
        },
        {
            name: "CAMPING",
            description: "Find your escape in nature.",
            image: "https://images.unsplash.com/photo-1657664069060-706017d35842?auto=format&fit=crop&w=1200&q=85"
        },
        {
            name: "HIKING",
            description: "Every trail tells a story.",
            image: "https://images.unsplash.com/photo-1737063610163-5f5b89af4e81?auto=format&fit=crop&w=1200&q=85"
        }
    ];

    return (

        <div className="bg-white">

            {/* HERO SECTION */}

            <section className="relative h-[750px] flex items-center">

                <img
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2000"
                    alt="Mountain adventure"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-8 w-full text-white">

                    <p className="text-green-400 tracking-[5px] text-sm font-semibold mb-6">
                        BUILT FOR THE WILD
                    </p>

                    <h1 className="text-6xl md:text-8xl font-bold max-w-4xl leading-tight">
                        THE WORLD
                        <br />
                        IS YOUR
                        <span className="text-green-400"> TRAIL.</span>
                    </h1>

                    <p className="mt-8 text-gray-200 text-lg max-w-xl leading-relaxed">
                        Discover premium outdoor equipment designed
                        for those who never stop exploring.
                        Your next adventure begins here.
                    </p>

                    <div className="flex gap-5 mt-10 flex-wrap">

                        <Link
                            to="/products"
                            className="bg-green-700 hover:bg-green-600 px-9 py-4 font-semibold transition duration-300"
                        >
                            EXPLORE COLLECTION →
                        </Link>

                       

                    </div>

                    <div className="mt-20 flex gap-12 text-sm tracking-widest text-gray-300">

                        <div>
                            <h3 className="text-3xl text-white font-bold">01</h3>
                            <p className="mt-2">EXPLORE</p>
                        </div>

                        <div>
                            <h3 className="text-3xl text-white font-bold">02</h3>
                            <p className="mt-2">DISCOVER</p>
                        </div>

                        <div>
                            <h3 className="text-3xl text-white font-bold">03</h3>
                            <p className="mt-2">EXPERIENCE</p>
                        </div>

                    </div>

                </div>

            </section>


            {/* CATEGORIES SECTION */}

            <section className="py-24 px-8 max-w-7xl mx-auto">

                <div className="text-center mb-14">

                    <p className="text-green-700 tracking-[4px] text-sm font-semibold">
                        FIND YOUR ADVENTURE
                    </p>

                    <h2 className="text-4xl md:text-5xl font-bold mt-4 text-gray-900">
                        EXPLORE OUR WORLD
                    </h2>

                    <p className="text-gray-500 mt-4">
                        Everything you need for your next outdoor experience.
                    </p>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-7">

                    {categories.map(function(category) {

                        return (

                            <Link
                                to={`/products?category=${category.name}`}
                                key={category.name}
                                className="relative h-[430px] overflow-hidden group"
                            >

                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>

                                <div className="absolute bottom-10 left-8 text-white">

                                    <h3 className="text-3xl font-bold">
                                        {category.name}
                                    </h3>

                                    <p className="mt-2 text-gray-200">
                                        {category.description}
                                    </p>

                                    <p className="mt-5 text-sm tracking-widest">
                                        EXPLORE NOW →
                                    </p>

                                </div>

                            </Link>

                        );

                    })}

                </div>

            </section>


            {/* BRAND STORY SECTION */}

            <section className="bg-[#f4f5ef] py-24 px-8">

                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

                    <div>

                        <p className="text-green-700 tracking-[4px] text-sm font-semibold">
                            MORE THAN AN ADVENTURE
                        </p>

                        <h2 className="text-5xl font-bold mt-5 leading-tight text-gray-900">
                            MADE FOR
                            <br />
                            THE OUTDOORS.
                        </h2>

                        <p className="text-gray-600 mt-7 leading-8">
                            The mountains are calling. The trails are waiting.
                            At TrailNest, we believe every adventure deserves
                            the right equipment.
                        </p>

                        <p className="text-gray-600 mt-4 leading-8">
                            From your first hike to your most challenging
                            expedition, find equipment that helps you
                            explore with confidence.
                        </p>

                        <Link
                            to="/products"
                            className="inline-block mt-9 bg-green-800 text-white px-8 py-4 hover:bg-green-700 transition"
                        >
                            DISCOVER TRAILNEST →
                        </Link>

                    </div>

                    <div className="h-[500px] overflow-hidden">

                        <img
                            src="https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1000"
                            alt="Nature adventure"
                            className="w-full h-full object-cover"
                        />

                    </div>

                </div>

            </section>


            {/* WHY TRAILNEST */}

            <section className="py-24 px-8 max-w-7xl mx-auto">

                <div className="text-center mb-14">

                    <p className="text-green-700 tracking-[4px] text-sm font-semibold">
                        THE TRAILNEST DIFFERENCE
                    </p>

                    <h2 className="text-4xl font-bold mt-4">
                        WHY CHOOSE US?
                    </h2>

                </div>

                <div className="grid md:grid-cols-3 gap-12 text-center">

                    <div>
                        <div className="text-5xl mb-5">🏔️</div>
                        <h3 className="text-xl font-bold">Adventure Ready</h3>
                        <p className="text-gray-500 mt-3 leading-7">
                            Equipment selected for your outdoor journeys.
                        </p>
                    </div>

                    <div>
                        <div className="text-5xl mb-5">🎒</div>
                        <h3 className="text-xl font-bold">Quality Gear</h3>
                        <p className="text-gray-500 mt-3 leading-7">
                            Find the right gear for every adventure.
                        </p>
                    </div>

                    <div>
                        <div className="text-5xl mb-5">🌲</div>
                        <h3 className="text-xl font-bold">Explore Freely</h3>
                        <p className="text-gray-500 mt-3 leading-7">
                            Discover new places and create unforgettable memories.
                        </p>
                    </div>

                </div>

            </section>

        </div>

    );

}

export default Home;