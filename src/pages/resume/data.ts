/**
 * The résumé's content. One entry per card; the layout lives in Resume.tsx.
 * Add, reorder or edit entries here and the page rebuilds.
 */

/** A chip: a devicon (`devicon-*-plain colored`, brand-coloured) or Font Awesome (`fas fa-*`) icon and a label. */
export interface Skill {
  icon: string;
  label: string;
}

export interface Entry {
  title: string;
  date: string;
  /** The line under the date: organisation, role or course. */
  sub: string;
  subIcon?: string;
  /** Institution logo shown before `sub`. */
  logo?: { src: string; alt: string };
  /** Makes the whole card clickable (opens in a new tab), with a cursor-following hint. */
  link?: { href: string; hint: string };
  skills?: Skill[];
  bullets?: string[];
  badge?: string;
  courseHeader?: string;
  courses?: string[];
  /** A demo clip that only loads and plays while on screen. */
  video?: { poster: string; src: string; width: number; height: number };
}

export interface ResumeSection {
  id: string;
  title: string;
  items: Entry[];
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
}

export const SECTIONS: ResumeSection[] = [
  {
    "id": "education",
    "title": "EDUCATION",
    "items": [
      {
        "title": "Honours Computer Science Co-op (B.A.Sc.)",
        "date": "2022-Present",
        "sub": "McMaster University, Hamilton ON",
        "logo": {
          "src": "/assets/mcmaster.png",
          "alt": "McMaster University"
        },
        "badge": "📅 Currently Enrolled in 4th Year",
        "courseHeader": "Relevant CS Coursework:",
        "courses": [
          "🔄 (A-) COMPSCI 4SD3: Data-Driven Algorithms for Sequential Decision Making",
          "🐞 (A-) COMPSCI 3S03: Software Testing",
          "🔐 (A-) COMPSCI 4CR3: Applied Cryptography",
          "🔧 (A+) COMPSCI 3TB3: Syntax-Based Tools & Compilers",
          "🌍 (B+) COMPSCI 3N03: Computer Networks and Security",
          "🧠 (A-) COMPSCI 3MI3: Principles of Programming Languages",
          "⚙️ (A-) COMPSCI 3SH3: Operating Systems",
          "🧮 (A+) COMPSCI 2XC3: Algorithms and Software Design",
          "🖥️ (A-) COMPSCI 2GA3: Computer Architecture",
          "🌐 (A-) COMPSCI 1XD3: Intro to Software Using Web Programming",
          "🛠️ (A+) COMPSCI 1XC3: Development Basics",
          "💻 (A) COMPSCI 1MD3: Introduction to Programming",
          "🔢 (A) COMPSCI 1DM3: Discrete Math for Computer Science",
          "🎲 (A) STATS 2D03: Intro to Probability",
          "📊 (A-) MATH 1ZB3: Engineering Mathematics II-A",
          "➗ (A) MATH 1ZA3: Engineering Mathematics I",
          "📐 (A-) MATH 1B03: Linear Algebra 1"
        ]
      }
    ]
  },
  {
    "id": "workexperience",
    "title": "EXPERIENCE",
    "items": [
      {
        "title": "AI & Full Stack Developer - Undergraduate Research Assistant",
        "date": "Jan. 2026 – Present",
        "sub": "McMaster University – Wang Lab, Hamilton, ON",
        "skills": [
          {
            "icon": "devicon-python-plain colored",
            "label": "Python"
          },
          {
            "icon": "fas fa-flask",
            "label": "Flask"
          },
          {
            "icon": "devicon-react-original colored",
            "label": "React"
          },
          {
            "icon": "fas fa-drafting-compass",
            "label": "UI/UX"
          },
          {
            "icon": "fas fa-sitemap",
            "label": "Algorithms"
          },
          {
            "icon": "fas fa-bug",
            "label": "Debugging"
          },
          {
            "icon": "fas fa-project-diagram",
            "label": "Software Architecture"
          }
        ],
        "bullets": [
          "Architecting an end-to-end AI-powered clinical tool alongside PhD researchers for automated liver fibrosis quantification and diagnosis from medical imaging.",
          "Building the full stack application with a React frontend and Python/Flask backend, integrating deep learning models into a streamlined diagnostic pipeline."
        ],
        "video": {
          "poster": "/assets/demos/aifibrosis-poster.webp",
          "src": "/assets/demos/aifibrosis-demo.mp4",
          "width": 2016,
          "height": 1028
        }
      },
      {
        "title": "Front End Developer Intern",
        "date": "Summer 2024",
        "sub": "Bonbon Technologies, Los Angeles, California (Remote)",
        "skills": [
          {
            "icon": "devicon-html5-plain colored",
            "label": "HTML"
          },
          {
            "icon": "devicon-css3-plain colored",
            "label": "CSS"
          },
          {
            "icon": "devicon-javascript-plain colored",
            "label": "JavaScript"
          },
          {
            "icon": "devicon-svelte-plain colored",
            "label": "Svelte"
          },
          {
            "icon": "fas fa-code-branch",
            "label": "Front End Dev"
          },
          {
            "icon": "fas fa-bug",
            "label": "Debugging"
          }
        ],
        "bullets": [
          "Completed a work term of 4 months during the summer of 2024.",
          "Consistently met project deadlines utilizing the Svelte framework, Git, and GitHub to design and deploy web components that enhanced user engagement and registration for a loyalty program.",
          "Showcased adaptability and initiative during last minute design changes by other departments.",
          "Discussed business strategy and innovative AI solutions to reach a wider audience."
        ]
      },
      {
        "title": "Lifeguard & Pool Supervisor",
        "date": "Summer 2023",
        "sub": "City of Ottawa, Ottawa ON",
        "skills": [
          {
            "icon": "fas fa-users-cog",
            "label": "Leadership"
          },
          {
            "icon": "fas fa-comments",
            "label": "Mentorship"
          },
          {
            "icon": "fas fa-balance-scale",
            "label": "Conflict Mediation"
          },
          {
            "icon": "fas fa-calendar-check",
            "label": "Scheduling"
          }
        ],
        "bullets": [
          "Practiced strong interpersonal and leadership skills in mentoring less experienced lifeguards while having to adapt changing policy and safety standards to ensure safety for all patrons.",
          "Exercised patience and compassion as the mediator for conflict resolution between children.",
          "Adhered to safety procedures set out by City of Ottawa for working with chlorine, cleaning up dangerous objects routinely, resulting in no injuries or issues.",
          "Created an efficient task schedule for workers every morning to streamline opening procedures."
        ]
      },
      {
        "title": "Computer Science High School Tutor",
        "date": "Fall 2022",
        "sub": "Hamilton, ON (Remote)",
        "skills": [
          {
            "icon": "fas fa-chalkboard-teacher",
            "label": "Teaching"
          },
          {
            "icon": "devicon-python-plain colored",
            "label": "Python"
          },
          {
            "icon": "devicon-java-plain colored",
            "label": "Java"
          },
          {
            "icon": "fas fa-sitemap",
            "label": "Algorithms"
          },
          {
            "icon": "fas fa-bug",
            "label": "Debugging"
          }
        ],
        "bullets": [
          "Delivered comprehensive instruction on the Ontario ICS3U and ICS4U curriculum, covering fundamental programming concepts and logic.",
          "Facilitated deep technical understanding by breaking down complex algorithms, memory management concepts, and data structures into digestible, practical examples.",
          "Cultivated independent problem-solving skills through guided debugging sessions and code reviews, emphasizing clean syntax and efficient software design principles.",
          "Customized lesson plans to adapt to the student’s learning pace, resulting in improved academic performance and confidence in completing major capstone projects."
        ]
      }
    ]
  },
  {
    "id": "projects",
    "title": "PROJECTS",
    "items": [
      {
        "title": "Mock Market",
        "date": "Personal Project",
        "sub": "Full Stack Investor Practice Website",
        "link": {
          "href": "https://github.com/alexgaffen/investor-practice-website",
          "hint": "View on GitHub"
        },
        "skills": [
          {
            "icon": "devicon-react-original colored",
            "label": "React"
          },
          {
            "icon": "devicon-nodejs-plain colored",
            "label": "Node.js"
          },
          {
            "icon": "devicon-cplusplus-plain colored",
            "label": "C++"
          },
          {
            "icon": "devicon-docker-plain colored",
            "label": "Docker"
          },
          {
            "icon": "devicon-firebase-plain colored",
            "label": "Firebase"
          }
        ],
        "bullets": [
          "Designed a full-stack microservices application simulating stock market trading with a React frontend and Node.js backend.",
          "Implemented secure Google Authentication and real-time stock data retrieval using the Finnhub API.",
          "Developed a C++ service for algorithmic analysis to provide trading signals, integrated via Docker containers.",
          "Utilized Firebase for robust user authentication and portfolio data storage, allowing users to track virtual investment performance."
        ],
        "video": {
          "poster": "/assets/demos/mock-market-poster.webp",
          "src": "/assets/demos/mock-market-demo.mp4",
          "width": 2880,
          "height": 1532
        }
      },
      {
        "title": "Ghost Shell",
        "date": "Personal Project",
        "sub": "Autonomous AI Honeypot Agent",
        "link": {
          "href": "https://github.com/alexgaffen/GhostShell",
          "hint": "View on GitHub"
        },
        "skills": [
          {
            "icon": "devicon-python-plain colored",
            "label": "Python"
          },
          {
            "icon": "devicon-go-original-wordmark colored",
            "label": "Go"
          },
          {
            "icon": "devicon-docker-plain colored",
            "label": "Docker"
          },
          {
            "icon": "devicon-linux-plain colored",
            "label": "Linux"
          },
          {
            "icon": "fas fa-terminal",
            "label": "SSH"
          }
        ],
        "bullets": [
          "Developing an autonomous AI agent in Python that prototypes intelligent automation by planning and executing commands via an LLM-driven reasoning loop.",
          "Built a custom Go-based terminal emulator and virtual honey-filesystem to provide a high-fidelity, sandboxed environment for capturing and analyzing malicious activity."
        ]
      },
      {
        "title": "Networked Battle Game",
        "date": "Final Project (A+)",
        "sub": "Course: Computer Networks and Security",
        "skills": [
          {
            "icon": "devicon-cplusplus-plain colored",
            "label": "C"
          },
          {
            "icon": "fas fa-plug",
            "label": "Socket Programming"
          },
          {
            "icon": "fas fa-server",
            "label": "Client-Server Architecture"
          }
        ],
        "bullets": [
          "Developed a client-server game in C as the final project for Computer Networks and Security course.",
          "Implemented socket programming and network protocols to manage real-time data exchange and communication between multiple clients."
        ]
      },
      {
        "title": "Matrix Visualizer Web App",
        "date": "Grade Received: A-",
        "sub": "Team Collaboration (6 members)",
        "link": {
          "href": "https://github.com/singk17/MathVisualizer",
          "hint": "View on GitHub"
        },
        "skills": [
          {
            "icon": "devicon-elm-plain colored",
            "label": "Elm"
          },
          {
            "icon": "fas fa-drafting-compass",
            "label": "UX/UI Design Principles"
          }
        ],
        "bullets": [
          "Collaborated in a team of 6 to design and code graphing software using Elm language.",
          "Followed UX and UI design principles for ease of use and aesthetic purposes."
        ]
      }
    ]
  },
  {
    "id": "competitions-awards",
    "title": "AWARDS",
    "items": [
      {
        "title": "McMaster University Award of Excellence",
        "date": "2023",
        "sub": "McMaster University — Entrance Scholarship ($3,000)",
        "bullets": [
          "Awarded for outstanding academic achievement upon admission."
        ]
      },
      {
        "title": "Euclid Mathematics Contest",
        "date": "2022",
        "sub": "University of Waterloo — 1st Place in School",
        "bullets": [
          "Achieved the highest score among all participants at my high school in this nationally recognized contest."
        ]
      },
      {
        "title": "Canadian Senior Mathematics Contest",
        "date": "2021",
        "sub": "University of Waterloo — 1st Place in School",
        "bullets": [
          "Earned the top score at my high school in the CSMC, a national-level competition for senior students."
        ]
      }
    ]
  },
  {
    "id": "certifications",
    "title": "CERTIFICATIONS",
    "items": [
      {
        "title": "Deep Learning Specialization",
        "date": "Dec 2025 – Present",
        "sub": "DeepLearning.AI (Coursera) — 5-Course Specialization by Andrew Ng",
        "link": {
          "href": "https://www.coursera.org/specializations/deep-learning",
          "hint": "View on Coursera"
        },
        "skills": [
          {
            "icon": "devicon-tensorflow-original colored",
            "label": "TensorFlow"
          },
          {
            "icon": "devicon-keras-plain colored",
            "label": "Keras"
          },
          {
            "icon": "devicon-python-plain colored",
            "label": "Python"
          }
        ],
        "bullets": [
          "Neural Networks & Deep Learning — foundations of deep learning and neural network architectures.",
          "Improving Deep Neural Networks — hyperparameter tuning, regularization, and optimization (Adam, RMSprop, batch norm).",
          "Structuring Machine Learning Projects — ML strategy, error analysis, and transfer learning best practices.",
          "Convolutional Neural Networks (CNNs) — image recognition, object detection (YOLO), and neural style transfer.",
          "Sequence Models (RNNs/LSTMs) — NLP, attention mechanisms, and transformer architectures."
        ]
      },
      {
        "title": "PyTorch for Deep Learning",
        "date": "Dec 2025 – Present",
        "sub": "DeepLearning.AI (Coursera)",
        "link": {
          "href": "https://www.coursera.org/professional-certificates/pytorch-for-deep-learning",
          "hint": "View on Coursera"
        },
        "skills": [
          {
            "icon": "devicon-pytorch-original colored",
            "label": "PyTorch"
          },
          {
            "icon": "devicon-python-plain colored",
            "label": "Python"
          }
        ],
        "bullets": [
          "Building and training neural networks using PyTorch's dynamic computational graphs.",
          "Implementing CNNs, RNNs, and custom model architectures with torch.nn modules.",
          "GPU-accelerated training, model evaluation, and deployment workflows."
        ]
      },
      {
        "title": "Machine Learning A-Z: AI, Python & R",
        "date": "Dec 2024 – Present",
        "sub": "Udemy — Kirill Eremenko & Hadelin de Ponteves",
        "link": {
          "href": "https://www.udemy.com/course/machinelearning/",
          "hint": "View on Udemy"
        },
        "skills": [
          {
            "icon": "devicon-python-plain colored",
            "label": "Python"
          },
          {
            "icon": "devicon-r-plain colored",
            "label": "R"
          },
          {
            "icon": "fas fa-chart-line",
            "label": "Scikit-learn"
          }
        ],
        "bullets": [
          "Regression, classification, clustering, and association rule learning with real-world datasets.",
          "Dimensionality reduction (PCA, LDA), model selection, and boosting (XGBoost).",
          "Natural Language Processing and reinforcement learning fundamentals."
        ]
      }
    ]
  },
  {
    "id": "hobbies-interests",
    "title": "INTERESTS",
    "items": [
      {
        "title": "McMaster Symphony Orchestra",
        "date": "2022 – Present",
        "sub": "Violinist",
        "subIcon": "fas fa-music",
        "bullets": [
          "Perform as a violinist with the McMaster Symphony Orchestra, rehearsing and performing orchestral repertoire throughout the academic year."
        ]
      },
      {
        "title": "McMaster Intramural Team Sports",
        "date": "2023 – Present",
        "sub": "Soccer, Pickleball, Football",
        "subIcon": "fas fa-futbol",
        "bullets": [
          "Compete in intramural leagues across multiple sports, fostering teamwork and sportsmanship in a competitive environment."
        ]
      }
    ]
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    "title": "PROGRAMMING LANGUAGES & TOOLS",
    "skills": [
      {
        "icon": "devicon-python-plain colored",
        "label": "Python"
      },
      {
        "icon": "devicon-cplusplus-plain colored",
        "label": "C/C++"
      },
      {
        "icon": "devicon-bash-plain colored",
        "label": "Bash"
      },
      {
        "icon": "devicon-html5-plain colored",
        "label": "HTML"
      },
      {
        "icon": "devicon-css3-plain colored",
        "label": "CSS"
      },
      {
        "icon": "devicon-javascript-plain colored",
        "label": "JavaScript"
      },
      {
        "icon": "devicon-react-original colored",
        "label": "React"
      },
      {
        "icon": "devicon-nodejs-plain colored",
        "label": "Node.js"
      },
      {
        "icon": "devicon-svelte-plain colored",
        "label": "Svelte"
      },
      {
        "icon": "devicon-linux-plain colored",
        "label": "Unix / Linux"
      },
      {
        "icon": "devicon-git-plain colored",
        "label": "Git / GitHub"
      },
      {
        "icon": "devicon-docker-plain colored",
        "label": "Docker"
      },
      {
        "icon": "devicon-vscode-plain colored",
        "label": "VS Code"
      },
      {
        "icon": "devicon-firebase-plain colored",
        "label": "Firebase"
      }
    ]
  },
  {
    "title": "CYBERSECURITY & NETWORKING",
    "skills": [
      {
        "icon": "fas fa-lock",
        "label": "Firewalls / VPNs"
      },
      {
        "icon": "fas fa-network-wired",
        "label": "Network Protocols"
      },
      {
        "icon": "fas fa-plug",
        "label": "Socket Programming"
      },
      {
        "icon": "fas fa-shield-alt",
        "label": "Network Security"
      },
      {
        "icon": "fas fa-desktop",
        "label": "Cisco Equipment"
      },
      {
        "icon": "fas fa-layer-group",
        "label": "OSI Model"
      }
    ]
  },
  {
    "title": "INTERPERSONAL & LEADERSHIP",
    "skills": [
      {
        "icon": "fas fa-comments",
        "label": "Communication"
      },
      {
        "icon": "fas fa-users-cog",
        "label": "Team Leadership"
      },
      {
        "icon": "fas fa-lightbulb",
        "label": "Problem-Solving"
      },
      {
        "icon": "fas fa-balance-scale",
        "label": "Conflict Mediation"
      }
    ]
  }
];
