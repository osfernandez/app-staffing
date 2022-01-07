import type { Project } from "../../../services/api";

import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@chakra-ui/layout";
import { Flex, Text } from "@chakra-ui/react";
import {
  useProject as defaultUseProject,
  useRoleMutations as defaultRoleMutation,
  useProjectMutations as defaultUseProjectMutations,
} from "../../../services/api";
import { Image } from "@chakra-ui/image";
import ProjectDeleteButton from "../components/ProjectDeleteButton";
import ProjectDescription from "../components/ProjectDescription";
import RoleList from "../components/RoleList";
import ProjectsHeader from "../Projects/components/ProjectsHeader";
interface ProjectDetailProps {
  useProject: typeof defaultUseProject;
  useProjectMutations: typeof defaultUseProjectMutations;
  useRoleMutations: typeof defaultRoleMutation;
}

export function ProjectDetail({
  useProject = defaultUseProject,
  useProjectMutations = defaultUseProjectMutations,
  useRoleMutations = defaultRoleMutation,
}: ProjectDetailProps): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const project = useProject(id);

  const { updateProject, destroyProject } = useProjectMutations();
  const { updateRole, destroyRole } = useRoleMutations();

  const onSave = (id: string, updated: Partial<Project>) => {
    updateProject(id, { ...project, ...updated });
  };
  console.log("project", project.roles);
  return (
    <div>
      <ProjectsHeader name={project?.name} />

      {project && (
        <>
          <ProjectDescription onEdit={onSave} project={project} />
          <RoleList
            destroyRole={destroyRole}
            updateRole={updateRole}
            project={project}
          />

          <Box mt={10}>
            <ProjectDeleteButton
              projectName={project.name}
              projectId={project.id}
              destroyProject={destroyProject}
            />
          </Box>
        </>
      )}

      {project.roles.length === 0 && (
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
          <Image
            height="100px"
            width="100px"
            src="../assets/images/folderWithFile.png"
            alt="Folder With File"
          />
          <Text fontWeight="bold" fontSize="16px" lineHeight="24px">
            There are currently no roles available.
          </Text>
        </Flex>
      )}
    </div>
  );
}

export default function ProjectDetailWrapper(): JSX.Element {
  return (
    // TODO: Skeleton
    <Suspense fallback={<h1>loading</h1>}>
      <ProjectDetail
        useProject={defaultUseProject}
        useProjectMutations={defaultUseProjectMutations}
        useRoleMutations={defaultRoleMutation}
      />
    </Suspense>
  );
}
