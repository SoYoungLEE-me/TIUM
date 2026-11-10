import { Route, Routes } from "react-router";

import AppLayout from "../layouts/AppLayout";

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<div>Home</div>} />
      </Route>
    </Routes>
  );
};
