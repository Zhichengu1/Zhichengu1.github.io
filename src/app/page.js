export default function Home() {
  return (
    <div className="bg-[#000] text-[#fff] font flex flex-col">
      {/* Fixed header that stays at the top of the page with its own background color */}
      <div className="top-0 left-0 right-0 w-full z-50">
        <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="font-bold text-xl md:text-2xl tracking-wider">Hey there!</div>
            <div>Projects</div>
          </div>
          <hr className="border-t border-gray-300 my-4" />
          <div className="text-center font-serif">
            <h1 className="font-bold text-xl md:text-2xl tracking-wider">ZHICHENG</h1>
            <h2 className="font-medium text-medium md:text-xl tracking-wider">
              student
              <br />
              fullstack / machine learning
              <br />
              engineer
            </h2>
          </div>
          <hr className="border-t border-gray-300 my-4" />
          <section className="min-h-screen">
            <div className="text-center font-medium mb-4">Education</div>
            <div className="mb-4">Schools</div>
            <div className="">
              <ul className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <li>
                  <div>City University Of New York: Hunter College</div>
                  <div>Bachelor Of Arts in Computer Science</div>
                  <div>Date: 2024 - 2027</div>
                  <div>GPA: 3.40</div>
                </li>
                <li>
                  <div>State University Of New York</div>
                  <div>Department of Engineering: Computer Engineering</div>
                  <div>Date: 2023 - 2024</div>
                  <div>GPA: 3.70</div>
                </li>
              </ul>
            </div>
            <hr className="border-t border-gray-300 my-4" />
            <div className="flex flex-col flex-wrap justify-evenly">
              <div className="text-center font-medium mb-4">My Tech Stack</div>
              <div className="flex flex-row justify-evenly flex-wrap gap-10">
                <div className="space-y-4 w-full max-w-md">
                  <div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Python</span>
                      <span>80%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: "80%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 w-full max-w-md">
                  <div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>C++</span>
                      <span>70%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3">
                      <div className="bg-green-400 h-3 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 w-full max-w-md">
                  <div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>JavaScript</span>
                      <span>30%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3">
                      <div className="bg-red-600 h-3 rounded-full" style={{ width: "30%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 w-full max-w-md">
                  <div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Go</span>
                      <span>30%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3">
                      <div className="bg-red-500 h-3 rounded-full" style={{ width: "30%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 w-full max-w-md">
                  <div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Css</span>
                      <span>60%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 w-full max-w-md">
                  <div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Html</span>
                      <span>60%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center font-medium mb-4">Development Tools</div>
              <div className="flex flex-row justify-evenly flex-wrap">
                <div className="space-y-4 w-full max-w-md">
                  <div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Flask</span>
                      <span>50%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: "50%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-4 w-full max-w-md">
                    <div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>React</span>
                        <span>50%</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: "50%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 w-full max-w-md">
                    <div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Next.js</span>
                        <span>50%</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: "50%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center p-20">....More to Learn</div>
          </section>
          <hr className="border-t border-gray-300 my-4" />
          <section className="min-h-screen text-white text-center">Experience</section>
        </div>
      </div>
    </div>
  );
}
