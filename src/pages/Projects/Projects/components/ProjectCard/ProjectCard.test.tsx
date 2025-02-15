import { render, screen } from "@testing-library/react";
import { StylesProvider } from "@chakra-ui/system";
import { MemoryRouter } from "react-router-dom";

import theme from "../../../../../theme";
import { projects } from "../../../../../mocks/fixtures";

import ProjectCard from "./ProjectCard";

const project = projects[0];

describe("Components/Layout", () => {
  it("renders project info and view link", () => {
    render(
      <MemoryRouter>
        <StylesProvider value={theme}>
          <table>
            <tbody>
              <ProjectCard key={project.id} project={project} />
            </tbody>
          </table>
        </StylesProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText(project.name)).toBeInTheDocument();
    expect(screen.getByText(project?.description || "")).toBeInTheDocument();
    expect(screen.getByText("View")).toBeInTheDocument();
  });
});
