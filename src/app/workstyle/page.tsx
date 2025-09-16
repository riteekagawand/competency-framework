import Image from 'next/image';
import anchor from 'public/svgs/Anchor.svg'
import connector from 'public/svgs/Connector.svg'
import envisioner from 'public/svgs/Envisioner.svg'
import strategist from 'public/svgs/Strategist.svg'
import thumbsup from 'public/svgs/thumbsup.svg'
interface WorkStyleData {
  id: string;
  title: string;
  roles: string[];
  color: {
    bg: string;
    text: string;
    accent: string;
  };
  icon: string;
  details: {
    mainAttribute: string;
    traits: string[];
  };
  sharedAttributes: {
    [key: string]: string[];
  };
}

const workStyles: WorkStyleData[] = [
  {
    id: 'envisioner',
    title: 'Envisioner',
    roles: ['Innovator', 'Trendsetter'],
    color: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      accent: 'bg-green-500'
    },
    icon: envisioner,
    details: {
      mainAttribute: 'Exploration, Creativity',
      traits: ['Outgoing', 'Imaginative', 'Spontaneous', 'Adaptable', 'Risk-seeking']
    },
    sharedAttributes: {
      strategist: ['Innovation-driven planning', 'Strategic creativity', 'Future-focused analysis'],
      connector: ['Inspiring leadership', 'Creative communication', 'Change catalyst']
    }
  },
  {
    id: 'strategist',
    title: 'Strategist',
    roles: ['Optimiser', 'Analyser'],
    color: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      accent: 'bg-orange-500'
    },
    icon: strategist,
    details: {
      mainAttribute: 'Analysis, Planning & Optimization',
      traits: ['Analytical', 'Methodical', 'Strategic', 'Detail-oriented', 'Systematic']
    },
    sharedAttributes: {
      envisioner: ['Innovation-driven planning', 'Strategic creativity', 'Future-focused analysis'],
      anchor: ['Systematic execution', 'Structured approach', 'Detail-oriented planning']
    }
  },
  {
    id: 'connector',
    title: 'Connector',
    roles: ['Facilitator', 'Empath'],
    color: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      accent: 'bg-blue-500'
    },
    icon: connector,
    details: {
      mainAttribute: 'Communication & Relationship Building',
      traits: ['Empathetic', 'Collaborative', 'Supportive', 'Social', 'Team-oriented']
    },
    sharedAttributes: {
      envisioner: ['Inspiring leadership', 'Creative communication', 'Change catalyst'],
      anchor: ['People-focused stability', 'Supportive implementation', 'Team guidance']
    }
  },
  {
    id: 'anchor',
    title: 'Anchor',
    roles: ['Guardian', 'Implementor'],
    color: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      accent: 'bg-red-500'
    },
    icon: anchor,
    details: {
      mainAttribute: 'Stability & Implementation',
      traits: ['Reliable', 'Structured', 'Consistent', 'Practical', 'Process-driven']
    },
    sharedAttributes: {
      strategist: ['Systematic execution', 'Structured approach', 'Detail-oriented planning'],
      connector: ['People-focused stability', 'Supportive implementation', 'Team guidance']
    }
  }
];

export default function WorkStyle() {
  return (
    <div className="container py-16    ">
      <div className="relative ml-36 max-w-4xl">
        {/* Center Point */}
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-20 flex h-40 w-40 flex-row items-center justify-center rounded-full  border-2 border-purple-500 bg-white">
         
        </div>

       <div className="group -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-40 flex h-32 w-32 items-center justify-center rounded-full border border-purple-500 bg-white hover:bg-purple-500">
          <div className="flex flex-col items-center justify-center">
            <span className="text-center font-semibold text-xl text-purple-600 group-hover:text-white">
              Know your
            </span>
            <span className="text-center font-extralight text-xl text-purple-600 group-hover:text-white">
              work style
            </span>
          </div>
        </div>


        {/* Shared Attributes Connectors */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Vertical Connector */}
          <div className="-translate-x-1/3 absolute top-0 bottom-0 left-1/2 h-full">
            <svg width="12" height="560" viewBox="0 0 12 560" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 0L0.226497 10L11.7735 10L6 0ZM5.99998 560L11.7735 550L0.226473 550L5.99998 560ZM5 9L4.99998 551L6.99998 551L7 9L5 9Z" fill="#865DBE"/>
            </svg>
          </div>

          {/* Horizontal Connector */}
          <div className="absolute top-1/2 right-0-translate-y-1/2 left-7 w-full">
            <svg width="840" height="12" viewBox="0 0 840 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M0 6L10 11.7735L10 0.226498L0 6ZM840 6.00007L830 0.22657L830 11.7736L840 6.00007ZM9 7L831 7.00007L831 5.00007L9 5L9 7Z" fill="#865DBE"/>
            </svg>
          </div>

          {/* Shared Attributes Boxes */}
          <div className="pointer-events-none absolute inset-0 z-20">
            {/* Top Button - Between Envisioner and Strategist */}
            <div className="-translate-x-1/2 -translate-y-3 group pointer-events-auto absolute top-[13%] left-1/2 text-center">
              <div className="w-[130px] rounded-lg bg-purple-100 px-4 py-2">
                <div className="group-hover:hidden">
                  <span className="text-purple-600 text-sm">Attributes</span>
                </div>
                <div className="hidden group-hover:block">
                  {workStyles[0]?.sharedAttributes.strategist?.map((attr, i) => (
                    <div key={`envisioner-strategist-${attr}`} className="mb-1 text-purple-600 text-xs">{attr}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Button - Between Strategist and Anchor */}
            <div className="-translate-y-1/2 group pointer-events-auto absolute top-1/2 right-[20%] translate-x-3">
              <div className="w-[130px] rounded-lg bg-purple-100 px-4 py-2 text-center">
                <div className="group-hover:hidden">
                  <span className="text-purple-600 text-sm">Attributes</span>
                </div>
                <div className="hidden group-hover:block">
                  {workStyles[1]?.sharedAttributes.anchor?.map((attr) => (
                    <div key={`attr-${attr}`} className="mb-1 text-purple-600 text-xs">{attr}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Button - Between Connector and Anchor */}
            <div className="-translate-x-1/2 group pointer-events-auto absolute bottom-[13%] left-1/2 translate-y-3 text-center">
              <div className="w-[130px] rounded-lg bg-purple-100 px-4 py-2">
                <div className="group-hover:hidden">
                  <span className="text-purple-600 text-sm">Attributes</span>
                </div>
                <div className="hidden group-hover:block">
                  {workStyles[2]?.sharedAttributes.anchor?.map((attr) => (
                    <div key={`attr-${attr}`} className="mb-1 text-purple-600 text-xs">{attr}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Left Button - Between Envisioner and Connector */}
            <div className="-translate-x-3 -translate-y-1/2 group pointer-events-auto absolute top-1/2 left-[20%]">
              <div className="w-[130px] rounded-lg bg-purple-100 px-4 py-2 text-center">
                <div className="group-hover:hidden">
                  <span className="text-purple-600 text-sm">Attributes</span>
                </div>
                <div className="hidden group-hover:block">
                  {workStyles[0]?.sharedAttributes.connector?.map((attr) => (
                    <div key={`attr-${attr}`} className="mb-1 text-purple-600 text-xs">{attr}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          
          
          
          
          
        </div>

        <div className="relative grid grid-cols-2 grid-rows-2 gap-10">
          {/* Shared Attributes Overlays */}
          

          {workStyles.map((style) => (
            <div 
              key={style.id} 
              className={`
                ${style.color.bg} group relative h-[250px] w-[300px] ${style.id === 'anchor' ? 'border-3 border-red-500' : 'border-none'} cursor-pointer rounded-4xl p-14 transition-all duration-300 ease-in-out hover:scale-x-110 ${(style.id === 'envisioner' || style.id === 'connector') 
                  ? "origin-right hover:scale-x-110  ml-auto" 
                  : 'origin-left hover:scale-x-110 '
                }
              `}
            >
             

             {/* icons mapped */}

           <div className={`absolute flex h-24 w-24 items-center justify-center rounded-full group-hover:scale-x-90 ${style.id === 'envisioner' || style.id === 'connector' 
                  ? "-translate-y-1/2 top-[50%] left-[-50px] transform" 
                  : "-translate-y-1/2 top-[50%] right-[-50px] transform"
                }`}
              >
                {typeof style.icon === 'string' ? (
                  <svg className="h-24 w-24 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.icon} />
                  </svg>
                ) : (
                  <Image
                    src={style.icon}
                    alt={`${style.title} icon`}
                    width={96}
                    height={96}
                    className="h-32 w-32"
                  />
                )}
              </div>
              <div className={`absolute flex h-24 w-24 items-center justify-center rounded-full group-hover:scale-x-90 ${style.id === 'anchor' ? "block" : 'hidden'} right-[100px] bottom-[-20%] transform`}
              >
                
                  <Image
                    src={thumbsup}
                    alt={`${style.title} icon`}
                    width={8}
                    height={8}
                    className="h-8 w-8"
                  />
                
              </div>




              <div className={`flex flex-col ${style.id === 'envisioner' || style.id === 'connector'  ? 'items-start' : 'items-end'} h-full justify-center gap-4 text-center group-hover:scale-x-90`}>
                <div className="group-hover:hidden">
                  <h2 className={`font-semibold text-2xl ${style.color.text}`}>{style.title}</h2>
                  <div className={`flex flex-col ${style.id === 'envisioner' || style.id === 'connector'  ? 'items-start' : 'items-end'} ${style.color.text}`}>
                    {style.roles.map((role, index) => (
                      <span key={role} className="text-sm">{role}</span>
                    ))}
                  </div>
                </div>
                
                <div className="hidden w-full group-hover:block">
                  <div className={`${style.color.text} ${
                    style.id === 'envisioner' || style.id === 'connector'
                      ? 'text-start'
                      : 'text-end'
                  }`}>
                    <h2 className={`font-semibold text-xl ${style.color.text} mb-1 ${
                      style.id === 'envisioner' || style.id === 'connector'
                        ? 'text-start'
                        : 'text-end'
                    }`}>{style.title}</h2>
                    <div className={`flex flex-col ${
                      style.id === 'envisioner' || style.id === 'connector'
                        ? 'items-start'
                        : 'items-end'
                    } ${style.color.text} mb-2`}>
                      {style.roles.map((role, index) => (
                        <span key={role} className="text-xs">{role}</span>
                      ))}
                    </div>
                    <div className={`flex items-center ${
                      style.id === 'envisioner' || style.id === 'connector'
                        ? 'justify-start'
                        : 'justify-end'
                    } mb-3 gap-2`}>
                      {style.id === 'envisioner' || style.id === 'connector' ? (
                        <>
                          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <p className="font-medium text-sm">{style.details.mainAttribute}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-sm">{style.details.mainAttribute}</p>
                          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </>
                      )}
                    </div>
                    <div className={`flex flex-col ${style.id === 'envisioner' || style.id === 'connector'  ? 'items-start' : 'items-end'}`}>
                      {style.details.traits.map((trait, index) => (
                        <p key={trait} className={`text-sm ${style.color.text}`}>
                          {trait}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

