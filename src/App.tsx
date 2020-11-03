import React, { useState, useEffect, useRef } from 'react'
import styled from '@emotion/styled'

const Main = styled.main`
  .central-station {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .about {
    background-color: rgba(255, 255, 255, 0.2);
    padding: 12px;
    padding-left: 40px;
    border-radius: 12px;
    h2 {
      margin-top: 0;
    }
  }

  .menu {
    position: absolute;
    top: 48px;
    li {
      margin-bottom: 12px;
      a {
        color: #16c60c;
        text-decoration: none;
        &:hover {
          border-bottom: 1px solid #16c60c;
        }
      }
    }
  }

  input {
    line-height: 44px;
    font-size: 36px;
    border: none;
    background: none;
    outline: none;
    color: #16c60c;
    text-align: center;
  }

  .question {
    position: absolute;
    right: 24px;
    top: 24px;
    svg {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.4s ease-in-out;
      &:hover {
        /* transform: rotate(360deg); */
        circle {
          fill: #16c60c;
          /* stroke: #0c0c0c; */
        }
        path,
        rect {
          fill: #0c0c0c;
        }
      }
      path,
      rect {
        fill: #16c60c;
      }
      circle {
        stroke: #16c60c;
        stroke-width: 16px;
      }
    }

    .popup {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: none;
      position: absolute;
      top: 38px;
      right: -13px;
      width: 320px;
      margin: 0;
      direction: rtl;
      list-style: square;
      &::after {
        content: '';
        position: absolute;
        display: block;
        top: -8px;
        right: 17px;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid rgba(255, 255, 255, 0.2);
      }
    }
  }

  .cross {
    position: absolute;
    top: 5px;
    left: 5px;
    svg {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.4s ease-in-out;
      &:hover {
        /* transform: rotate(360deg);
         */
        path {
          fill: #ffffff;
        }
      }
      path {
        fill: #16c60c;
      }
    }
  }

  a {
    color: #16c60c;
    text-decoration: none;
    &:hover {
      border-bottom: 1px solid #16c60c;
    }
  }
`

const initialPhrase = 'h3ll0_w0r1d'

const questionMark = () => {
  return (
    <div
      className="question"
      onClick={() => {
        const popup = document.querySelector('.popup') as HTMLDivElement
        if (popup.style.display == 'block') {
          popup.style.display = 'none'
        } else {
          popup.style.display = 'block'
        }
      }}
    >
      <svg viewBox="0 0 282 282" xmlns="http://www.w3.org/2000/svg">
        <circle cx="141" cy="141" r="135" />
        <path
          d="M140.744,65.326c-26.002,0-47.157,21.154-47.157,47.157c0,4.971,4.029,9,9,9s9-4.029,9-9
		c0-16.077,13.08-29.157,29.157-29.157s29.157,13.08,29.157,29.157s-13.08,29.157-29.157,29.157c-4.971,0-9,4.029-9,9v34.601
		c0,4.971,4.029,9,9,9s9-4.029,9-9v-26.462c21.712-4.214,38.157-23.371,38.157-46.296C187.901,86.48,166.747,65.326,140.744,65.326z
		"
        />
        <path
          d="M140.744,208.164c-2.37,0-4.69,0.96-6.36,2.63c-1.68,1.68-2.64,4-2.64,6.37s0.96,4.689,2.64,6.359
		c1.67,1.681,3.99,2.641,6.36,2.641c2.37,0,4.69-0.96,6.36-2.641c1.68-1.67,2.64-3.989,2.64-6.359s-0.96-4.69-2.64-6.37
		C145.434,209.124,143.114,208.164,140.744,208.164z"
        />
      </svg>
      <ul className="popup">
        <li>Type &quot;blog&quot; to go to the blog</li>
        <li>Type &quot;about&quot; to see info about me</li>
        <li>Type &quot;lock&quot; to see the lock</li>
      </ul>
    </div>
  )
}

const crossIcon = (close: any) => {
  return (
    <div className="cross" onClick={close}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
          d="M343.586,315.302L284.284,256l59.302-59.302c7.81-7.81,7.811-20.473,0.001-28.284c-7.812-7.811-20.475-7.81-28.284,0
			L256,227.716l-59.303-59.302c-7.809-7.811-20.474-7.811-28.284,0c-7.81,7.811-7.81,20.474,0.001,28.284L227.716,256
			l-59.302,59.302c-7.811,7.811-7.812,20.474-0.001,28.284c7.813,7.812,20.476,7.809,28.284,0L256,284.284l59.303,59.302
			c7.808,7.81,20.473,7.811,28.284,0C351.398,335.775,351.397,323.112,343.586,315.302z"
        />
      </svg>
    </div>
  )
}

const App: React.FC<{}> = () => {
  const [text, setText] = useState('')
  const [animation, setAnimation] = useState(true)
  const [aboutVisible, setAboutVisible] = useState(false)
  const [lockVisible, setLockVisible] = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    const animateHelloWorld = () => {
      window.setTimeout(() => {
        if (text.length < initialPhrase.length) {
          setText(text + initialPhrase[text.length])
        }
        if (text.length === initialPhrase.length) {
          if (inputRef.current) (inputRef.current as HTMLInputElement).focus()
          setAnimation(false)
        }
      }, 100)
    }
    if (animation) animateHelloWorld()
  }, [text])

  return (
    <Main>
      {questionMark()}
      {lockVisible ? (
        <div className="central-station">
          <pre>{`
                *@@@@@@@@*                    
             %@@@#       #@@@%                
          @@@.   (&@@@@@&)   .@@@             
        .@@   @@@&       &@@@   @@.            
       .@@  (@@             @@)  @@.           
       @@   @@               @@   @@          
       @@   @@               @@   @@          
       @@   @@               @@   @@          
    (@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@)       
  *@@                                 @@*      
  *@(                                 )@*      
  *@(                                 )@*      
  *@(            (@@@@@@@             )@*      
  *@(           .@@     @@            )@*      
  *@(            %@@* &@@             )@*      
  *@(             @@  (@@             )@*      
  *@(            %@@@@@@@             )@*      
  *@(                                 )@*      
  *@(                                 )@*      
  *@@                                 @@* 
    (@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@) 
          `}</pre>
        </div>
      ) : aboutVisible ? (
        <div className="central-station">
          <div className="about">
            {crossIcon(() => {
              setAboutVisible(false)
              setText(initialPhrase)
            })}
            <h2>Denis Shtabnoy</h2>
            <h3>
              <a href="mailto:denis@shtabnoy.com">denis@shtabnoy.com</a>
            </h3>
            <ul>
              <li>
                <a href="https://github.com/shtabnoy">Developer</a>
              </li>
              <li>
                <a href="https://medium.com/@fractal_bit">Blockchain adept</a>
              </li>
              <li>
                <a href="https://www.youtube.com/channel/UCHbZse_bQNdU2PuD1WmCirg">
                  Musician
                </a>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="central-station">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={({ target: { value } }) => {
              setText(value)
            }}
            onKeyDown={({ keyCode }) => {
              if (keyCode == 13) {
                if (text === 'blog') {
                  location.href = 'https://blog.shtabnoy.com'
                }
                if (text === 'about') {
                  setAboutVisible(true)
                }
                if (text === 'lock') {
                  setLockVisible(true)
                }
              }
            }}
          />
        </div>
      )}
    </Main>
  )
}

export default App
