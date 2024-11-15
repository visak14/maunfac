import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";
import AgriTable from "./components/AgriTable";

export default function App() {
  return <MantineProvider theme={theme}>
    <AgriTable/>
  </MantineProvider>;
}
