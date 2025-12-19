import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
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
          <Route index element={<LandingPage />} />
          <Route path="convert" element={<ConvertPage />} />
          <Route path="crop-gif" element={<CropPage />} />
          <Route path="resize-gif" element={<ResizePage />} />
          <Route path="change-gif-speed" element={<SpeedPage />} />
          <Route path="reverse-gif" element={<ReversePage />} />
          <Route path="rotate-flip-gif" element={<RotatePage />} />
          <Route path="gif-to-frames" element={<SplitPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
