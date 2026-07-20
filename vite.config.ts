import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 750,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "three-core",
              test: /node_modules[/\\]three[/\\]/,
            },
            {
              name: "react-three",
              test: /node_modules[/\\]@react-three[/\\]/,
            },
          ],
        },
      },
    },
  },
});
