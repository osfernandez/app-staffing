import type { Project, NewProject } from "../../../../../services/api";

import { Box, Flex, Heading } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/hooks";

import AddProjectModal from "../AddProjectModal";
import SingleProjectBreadCrumb from "../../../../../components/Breadcrumbs/SingleProjectBreadCrumb";
import ProjectsBreadCrumb from "../../../../../components/Breadcrumbs/ProjectsBreadCrumb";

interface ProjectHeaderProps {
  loading?: boolean;
  addProject?: (project: NewProject) => void;
  project?: Project;
}

export default function ProjectsHeader({
  loading,
  addProject,
  project,
}: ProjectHeaderProps): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box mb={project ? "" : "48px"}>
      <Breadcrumb
        spacing="8px"
        marginBottom="16px"
        fontSize="14px"
        color="gray.500"
        separator={<ChevronRightIcon />}
      >
        <BreadcrumbItem>
          <BreadcrumbLink href="/" data-testid="homeBreadcrumb">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Conditionals for Breadcrumb focus */}
        {project ? (
          <SingleProjectBreadCrumb name={project.name} loading={loading} />
        ) : (
          <ProjectsBreadCrumb loading={loading} />
        )}
      </Breadcrumb>

      <Flex
        width="full"
        fontFamily="Arial, Helvetica, sans-serif"
        display="flex"
        justifyContent="space-between"
      >
        <Heading
          as="h1"
          textStyle="title"
          color="gray.700"
          data-testid="projectListTitle"
        >
          {project ? project.name : "Projects"}
        </Heading>

        {!project && (
          <>
            <Button
              size="lg"
              variant="primary"
              arialabel="Add Project"
              onClick={onOpen}
              data-testid="addProjectButton"
            >
              Add Project
            </Button>

            <AddProjectModal
              isOpen={isOpen}
              onClose={onClose}
              addProject={(project) => addProject?.(project)}
              project={project}
            />
          </>
        )}
      </Flex>
    </Box>
  );
}
