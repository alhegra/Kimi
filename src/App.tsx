import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Article from './pages/Article'
import CategoryPage from './pages/CategoryPage'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/article/:slug" element={<Article />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/tag/:slug" element={<CategoryPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/editor/:id?" element={<Editor />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
