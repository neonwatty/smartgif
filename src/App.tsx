import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ConvertPage } from './pages/ConvertPage';
import { CropPage } from './pages/CropPage';
import { ResizePage } from './pages/ResizePage';
import { SpeedPage } from './pages/SpeedPage';
import { ReversePage } from './pages/ReversePage';
import { RotatePage } from './pages/RotatePage';
import { SplitPage } from './pages/SplitPage';

function App() {
  return (
    <BrowserRouter basename="/smartgif">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ConvertPage />} />
          <Route path="crop" element={<CropPage />} />
          <Route path="resize" element={<ResizePage />} />
          <Route path="speed" element={<SpeedPage />} />
          <Route path="reverse" element={<ReversePage />} />
          <Route path="rotate" element={<RotatePage />} />
          <Route path="split" element={<SplitPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
