export type designationDataType = {
  designation: string;
  category: categoryType;
}[];

export type categoryType = {
  name: string;
  subCategory: {
    name: string;
    levels: string[];
  }[];
}[];

export enum SelectedDesignation {
  Associate_Software_Engineer = "Associate Software Engineer",
  Associate_UI_UX_Designer = "Associate UI/UX Designer",
}

export enum SelectedType {
  Default = "default",
  Self = "self",
  Manager = "manager",
  Achieved = "achieved",
}

type Department = {
  [key: string]: string[];
};

export const departmentsData: Department = {
  Engineering: ["Junior", "Mid", "Senior", "Lead"],
  Marketing: ["Intern", "Associate", "Manager", "Director"],
  Sales: ["Trainee", "Executive", "Manager", "VP"],
  Design: ["Junior Designer", "Designer", "Senior Designer", "Lead Designer"],
};

export enum CellColor {
  Red = "#FF4C4C",
  Yellow = "#FFD566",
  Green = "#8bd596",
  White = "#FFFFFF",
  Blue = "#61E4FF",
  Gray = "#DEDEDE",
  purple_dark = "#865DBE",
  purple_light = "#e7d2fb",
}

export type UserRadarData = {
  name: string;
  designation: string;
  defaultVals: number[];
  selfVals: number[];
  managerVals: number[];
  achievedVals: number[];
};

export const dummyUser: UserRadarData = {
  name: "Dummy User",
  designation: "N/A",
  defaultVals: [0, 0, 0, 0, 0, 0, 0, 0],
  selfVals: [0, 0, 0, 0, 0, 0, 0, 0],
  managerVals: [0, 0, 0, 0, 0, 0, 0, 0],
  achievedVals: [0, 0, 0, 0, 0, 0, 0, 0],
};

export const designationData: designationDataType = [
  {
    designation: "Associate Software Engineer",
    category: [
      {
        name: "Market",
        subCategory: [
          {
            name: "Users",
            levels: [
              "Understand basic user needs and goals.",
              "Identify user personas and demographics.",
              "Analyze user feedback and behavior patterns.",
              "Optimize solutions based on user experience research.",
              "Design user-centric systems to address complex needs.",
            ],
          },
          {
            name: "Industry",
            levels: [
              "Learn about the basics of the software industry.",
              "Understand common tools, frameworks, and trends.",
              "Analyze competitors and market demands.",
              "Evaluate industry-specific challenges and solutions.",
              "Propose innovative approaches to industry problems.",
            ],
          },
        ],
      },
      {
        name: "Product",
        subCategory: [
          {
            name: "Business",
            levels: [
              "Understand the product's value proposition.",
              "Learn about the business model and revenue streams.",
              "Analyze how the product meets market needs.",
              "Optimize features to align with business goals.",
              "Contribute to strategic decisions for scaling the product.",
            ],
          },
          {
            name: "Product",
            levels: [
              "Understand the product's core functionalities.",
              "Learn about the product roadmap and its purpose.",
              "Participate in feature prioritization and planning.",
              "Provide technical insights for product improvements.",
              "Lead technical aspects of major product initiatives.",
            ],
          },
        ],
      },
      {
        name: "Employee",
        subCategory: [
          {
            name: "Collaboration",
            levels: [
              "Communicate effectively with team members.",
              "Participate actively in team discussions and planning.",
              "Collaborate across teams to solve problems.",
              "Mentor junior colleagues on collaboration techniques.",
              "Lead cross-functional collaborations for key projects.",
            ],
          },
          {
            name: "Leadership",
            levels: [
              "Take ownership of small tasks and deliverables.",
              "Support teammates by offering guidance and feedback.",
              "Initiate and drive technical solutions for challenges.",
              "Lead project teams and ensure timely deliverables.",
              "Influence team culture and contribute to strategic planning.",
            ],
          },
        ],
      },
      {
        name: "Craft",
        subCategory: [
          {
            name: "Strategy",
            levels: [
              "Understand the team's technical strategy.",
              "Contribute ideas to improve technical practices.",
              "Align development efforts with strategic goals.",
              "Help refine and optimize team-wide strategies.",
              "Drive innovation and future technical directions.",
            ],
          },
          {
            name: "Tactics",
            levels: [
              "Execute tasks efficiently with given instructions.",
              "Optimize code for better performance and readability.",
              "Solve technical challenges with creative solutions.",
              "Implement best practices for efficient delivery.",
              "Devise tactical solutions for large-scale problems.",
            ],
          },
        ],
      },
    ],
  },
  {
    designation: "Associate UI/UX Designer",
    category: [
      {
        name: "Market",
        subCategory: [
          {
            name: "Users",
            levels: [
              "Understand basic user personas and their needs.",
              "Learn methods for gathering user feedback.",
              "Apply user research insights to design solutions.",
              "Collaborate with teams to refine user-centric designs.",
              "Create prototypes to address complex user needs.",
            ],
          },
          {
            name: "Industry",
            levels: [
              "Understand the basics of UI/UX design principles.",
              "Explore common design tools and software.",
              "Analyze competitor interfaces and user flows.",
              "Stay updated on industry trends and practices.",
              "Propose innovative solutions inspired by design trends.",
            ],
          },
        ],
      },
      {
        name: "Product",
        subCategory: [
          {
            name: "Business",
            levels: [
              "Understand the product's role in achieving business goals.",
              "Learn about the importance of branding in UI/UX design.",
              "Design interfaces that align with the business strategy.",
              "Suggest UI improvements to enhance user satisfaction.",
              "Participate in aligning UI/UX goals with business metrics.",
            ],
          },
          {
            name: "Product",
            levels: [
              "Learn the product's features and user workflows.",
              "Assist in designing intuitive user interfaces.",
              "Participate in feature design and wireframing.",
              "Collaborate on user testing and feedback analysis.",
              "Contribute to the iterative design of product features.",
            ],
          },
        ],
      },
      {
        name: "Self",
        subCategory: [
          {
            name: "Collaboration",
            levels: [
              "Work closely with developers and designers.",
              "Contribute to brainstorming sessions effectively.",
              "Provide and accept constructive feedback in teams.",
              "Collaborate across teams to improve user experiences.",
              "Assist in maintaining a positive and efficient team dynamic.",
            ],
          },
          {
            name: "Leadership",
            levels: [
              "Take ownership of small design tasks.",
              "Communicate your design ideas clearly.",
              "Show initiative in solving UI/UX challenges.",
              "Participate in presenting designs to stakeholders.",
              "Support the team in achieving project goals.",
            ],
          },
        ],
      },
      {
        name: "Craft",
        subCategory: [
          {
            name: "Strategy",
            levels: [
              "Understand the basics of design strategy.",
              "Contribute to creating user-centric design goals.",
              "Participate in defining long-term design plans.",
              "Support the alignment of UI/UX designs with strategies.",
              "Learn to refine and optimize design strategies.",
            ],
          },
          {
            name: "Tactics",
            levels: [
              "Execute design tasks efficiently and accurately.",
              "Optimize visual elements for better usability.",
              "Create wireframes and prototypes for testing.",
              "Apply best practices to improve designs iteratively.",
              "Solve design problems with creative solutions.",
            ],
          },
        ],
      },
    ],
  },
];
