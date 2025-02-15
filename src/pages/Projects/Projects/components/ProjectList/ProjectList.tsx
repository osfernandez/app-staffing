import { useCallback } from "react";
import {
  Box,
  BoxProps,
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  VisuallyHidden,
} from "@chakra-ui/react";
import { FolderWithFilesIcon } from "../../../../assets/Icons";

import ProjectCard from "../ProjectCard";
import { Project } from "../../../../../services/api";

interface ProjectListProps extends BoxProps {
  projects: Project[] | undefined;
}

export default function ProjectList({
  projects,
  ...rest
}: ProjectListProps): JSX.Element {
  const generateRows = useCallback(() => {
    return projects?.map(
      (project, index): JSX.Element => (
        <ProjectListRow key={project.id} project={project}>
          {projects.length - 1 !== index && <Tr height={5}></Tr>}
        </ProjectListRow>
      ),
    );
  }, [projects]);

  return (
    <>
      <Box {...rest}>
        {projects && projects.length === 0 && (
          <Flex
            width="100%"
            flexDirection="column"
            minHeight="30px"
            boxShadow="0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)"
            backgroundColor="white"
            padding="82px 30px 153px"
            border="1px solid #eee"
            borderRadius="4px"
            alignItems="center"
          >
            <FolderWithFilesIcon height="100" width="100" />
            <Text fontWeight="bold" fontSize="16px" lineHeight="24px">
              There are currently no projects available.
            </Text>
          </Flex>
        )}

        {projects && projects.length > 0 && (
          <>
            <Box maxHeight="80vh" overflowX="hidden">
              <Table variant="unstyled">
                <Thead position="sticky" top="0" zIndex="sticky" bg="gray.10">
                  <Tr>
                    <Th
                      pt="0px"
                      px="25px"
                      pb="26px"
                      color="gray.800"
                      textStyle="table.title"
                    >
                      NAME
                    </Th>
                    <Th
                      pt="0px"
                      px="25px"
                      pb="26px"
                      color="gray.800"
                      textStyle="table.title"
                    >
                      {/* Using <VisuallyHidden> here because although the Figma file doesn't contain this header, I assume it's an accessibility liability to use a blank table header. */}
                      <VisuallyHidden>DESCRIPTION</VisuallyHidden>
                    </Th>
                    <Th
                      pt="0px"
                      px="25px"
                      pb="26px"
                      pr={12}
                      color="gray.800"
                      textStyle="table.title"
                      isNumeric
                    >
                      ACTIONS
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>{generateRows()}</Tbody>
              </Table>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}

export const ProjectListRow = ({
  project,
  children,
}: {
  project: Project;
  children: JSX.Element | boolean;
}): JSX.Element => {
  return (
    <>
      <ProjectCard project={project} />
      {children}
    </>
  );
};
