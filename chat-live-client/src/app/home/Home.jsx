// pages/index.js (Next.js con Static Generation)
// export async function getStaticProps() {
//     console.log("Ejecutando getServerSideProps en el servidor...");

//     const res = await fetch("http://localhost:8081/api/v1/demo",

//         {
//             method: "POST",               // Especifica el método POST
//             headers: {
//               "Content-Type": "application/json",  // Especifica el tipo de contenido
//             },
//         }

//     );
//     const data = await res.json();

//     console.log("esta es data: "+data.message)
  
//     return data ;
//   }
  
  export default async function Home() {
    // const data = await getStaticProps()
    // console.log("rste es el data: "+data.message)
    return <div>Hola al home</div>;
  }
  