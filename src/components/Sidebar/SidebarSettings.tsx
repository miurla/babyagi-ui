import { FC } from "react";
import { GearIcon } from "@radix-ui/react-icons";
import { SidebarButton } from "./SidebarButton";

export const SidebarSettings: FC = () => {
  return (
    <SidebarButton text={"Settings"} icon={<GearIcon />} onClick={() => {}} />
  );
};
