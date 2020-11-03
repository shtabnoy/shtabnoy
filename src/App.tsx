/** @jsx jsx */
import React from 'react';
import styled from '@emotion/styled';
import { jsx, css } from '@emotion/core';

const Main = styled.main`
  height: 100%;
  display: grid;
  grid-template-columns: repeat(16, 25%);
  grid-template-rows: 100%;
`;

const App: React.FC<any> = () => {
  return (
    <Main>
      <div
        css={css`
          background-color: #e0af27;
          position: relative;
          grid-row: 1;
          grid-column: 1 / span 4;
          clip-path: polygon(0% 0%, 100% 0%, 75% 100%, 0% 100%);
        `}
      >
        <div
          css={css`
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          `}
        >
          Developer
        </div>
      </div>
      <div
        css={css`
          position: relative;
          background-color: #e75ae7;
          grid-row: 1;
          grid-column: 4 / span 4;
          clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
        `}
      >
        <div
          css={css`
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          `}
        >
          Musician
        </div>
      </div>
      <div
        css={css`
          position: relative;
          background-color: #44b4d6;
          grid-row: 1;
          grid-column: 7 / span 4;
          clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
        `}
      >
        <div
          css={css`
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          `}
        >
          Blockchain adept
        </div>
      </div>
      <div
        css={css`
          position: relative;
          background-color: #41d466;
          grid-row: 1;
          grid-column: 10 / span 4;
          clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
        `}
      >
        <div
          css={css`
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          `}
        >
          Linguistics nerd
        </div>
      </div>
    </Main>
  );
};

// TODO: add pre-commit npm run build husky hook

export default App;
