"use client"
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="bg-black text-white flex flex-col min-h-screen">
      {/* Main content container */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="font-bold text-xl md:text-2xl tracking-wider">Hey there!</div>
            <div>Projects</div>
          </div>
          <hr className="border-t border-gray-300 my-4" />
          
          {/* Profile section */}
          <div className="text-center font-serif">
            <h1 className="font-bold text-xl md:text-2xl tracking-wider">ZHICHENG</h1>
            <h2 className="font-medium text-base md:text-xl tracking-wider">
              student
              <br />
              fullstack / machine learning
              <br />
              engineer
            </h2>
          </div>
          <hr className="border-t border-gray-300 my-4" />
          
          {/* Education section */}
          <section className="py-8">
            <div className="text-center font-medium mb-4">Education</div>
            <div className="mb-4">Schools</div>
            <div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="p-4 border border-gray-700 rounded">
                  <div className="font-medium">City University Of New York: Hunter College</div>
                  <div>Bachelor Of Arts in Computer Science</div>
                  <div>Date: 2024 - 2027</div>
                  <div>GPA: 3.40</div>
                </li>
                <li className="p-4 border border-gray-700 rounded">
                  <div className="font-medium">State University Of New York</div>
                  <div>Department of Engineering: Computer Engineering</div>
                  <div>Date: 2023 - 2024</div>
                  <div>GPA: 3.70</div>
                </li>
              </ul>
            </div>
          </section>
          
          <hr className="border-t border-gray-300 my-4" />
          
          {/* Skills section */}
          <section className="py-8">
            <div className="flex flex-col gap-8">
              {/* Tech Stack */}
              <div>
                <div className="text-center font-medium mb-6">My Tech Stack</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Python</span>
                        <span>80%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: "80%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>C++</span>
                        <span>70%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-green-400 h-3 rounded-full" style={{ width: "70%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>JavaScript</span>
                        <span>30%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-red-600 h-3 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Go</span>
                        <span>30%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-red-500 h-3 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>CSS</span>
                        <span>60%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>HTML</span>
                        <span>60%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Development Tools */}
              <div>
                <div className="text-center font-medium mb-6">Development Tools</div>
                <div className="grid grid-row-1 md:grid-row-3 gap-6 max-w-3xl mx-auto">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Flask</span>
                        <span>50%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: "50%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>React</span>
                        <span>50%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: "50%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Next.js</span>
                        <span>50%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: "50%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center p-12 italic">....More to Learn</div>
          </section>
          
          <hr className="border-t border-gray-300 my-4" />
          
          {/* Experience section */}
          <section className="py-8">
            <div className="flex flex-col gap-8">
              <div className="text-center font-medium text-xl mb-6">Experience</div>
              <div className="flex justify-center">
      
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}