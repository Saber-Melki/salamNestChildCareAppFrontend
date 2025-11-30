"use client"

import React, { useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import {
  Camera,
  Upload,
  FolderPlus,
  ImageIcon,
  Video,
  Trash2,
  Eye,
  Play,
  Film,
  Sparkles,
  Lock,
  Globe,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "../components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../components/ui/alert-dialog"
import { AppShell, Section } from "../components/app-shell"

const API_BASE = "http://localhost:8080"

type MediaItem = {
  id: string
  type: "image" | "video"
  url: string
  title: string | null
  description: string | null
  albumId: string
  uploadDate: string
  tags: string[] | null
  sharedWith: string[] | null
}

type Album = {
  id: string
  name: string
  description: string
  itemCount: number
  isPublic: boolean
  coverImage?: string
  createdDate?: string
}

export default function Media() {
  const [albums, setAlbums] = React.useState<Album[]>([])
  const [mediaItems, setMediaItems] = React.useState<MediaItem[]>([])
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
  const [albumDialogOpen, setAlbumDialogOpen] = React.useState(false)
  const [editAlbumDialogOpen, setEditAlbumDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedAlbum, setSelectedAlbum] = React.useState<string>("all")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [editingAlbum, setEditingAlbum] = React.useState<Album | null>(null)
  const [itemToDelete, setItemToDelete] = React.useState<MediaItem | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [viewingItem, setViewingItem] = React.useState<MediaItem | null>(null)

  const [uploadFormData, setUploadFormData] = React.useState({
    files: [] as File[],
    albumId: "",
    title: "",
    description: "",
    tags: "",
    shareWith: [] as string[],
  })

  const [albumFormData, setAlbumFormData] = React.useState({
    name: "",
    description: "",
    isPublic: true,
  })

  const resetUploadForm = () =>
    setUploadFormData({ files: [], albumId: "", title: "", description: "", tags: "", shareWith: [] })

  const resetAlbumForm = () => setAlbumFormData({ name: "", description: "", isPublic: true })

  // ===== Fetch albums & media =====
  useEffect(() => {
    const fetchAlbums = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${API_BASE}/media/albums`)
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setAlbums(Array.isArray(data) ? data : [data])
      } catch (err) {
        console.error("Albums fetch error:", err)
        setAlbums([])
      } finally {
        setIsLoading(false)
      }
    }

    const fetchMedia = async () => {
      try {
        const url =
          selectedAlbum === "all"
            ? `${API_BASE}/media/items`
            : `${API_BASE}/media/items?albumId=${selectedAlbum}`

        const res = await fetch(url)
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setMediaItems(Array.isArray(data) ? data : [data])
      } catch (err) {
        console.error("Media fetch error:", err)
        setMediaItems([])
      }
    }

    fetchAlbums()
    fetchMedia()
  }, [selectedAlbum])

  // ===== Handlers =====
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadFormData((prev) => ({ ...prev, files }))
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFormData.files.length || !uploadFormData.albumId) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", uploadFormData.files[0])
    formData.append("albumId", uploadFormData.albumId)
    formData.append("title", uploadFormData.title)
    formData.append("description", uploadFormData.description)
    formData.append("tags", uploadFormData.tags)

    try {
      const res = await fetch(`${API_BASE}/media/items`, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error(await res.text())
      const savedItems: MediaItem[] = await res.json()

      // add new items to UI
      setMediaItems((prev) => [...prev, ...savedItems])

      // update album itemCount locally
      if (uploadFormData.albumId && savedItems.length > 0) {
        setAlbums((prev) =>
          prev.map((a) =>
            a.id === uploadFormData.albumId
              ? { ...a, itemCount: (a.itemCount ?? 0) + savedItems.length }
              : a,
          ),
        )
      }

      resetUploadForm()
      setUploadDialogOpen(false)
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/media/albums`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(albumFormData),
      })
      if (!res.ok) throw new Error(await res.text())
      const savedAlbum: Album = await res.json()
      setAlbums((prev) => [...prev, savedAlbum])
      resetAlbumForm()
      setAlbumDialogOpen(false)
    } catch (err) {
      console.error("Error creating album:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album)
    setAlbumFormData({ name: album.name, description: album.description, isPublic: album.isPublic })
    setEditAlbumDialogOpen(true)
  }

  // 🔧 now actually calls backend PUT /media/albums/:id
  const handleUpdateAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAlbum) return

    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/media/albums/${editingAlbum.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(albumFormData),
      })
      if (!res.ok) throw new Error(await res.text())
      const updated: Album = await res.json()

      setAlbums((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)))
      setEditAlbumDialogOpen(false)
      setEditingAlbum(null)
      resetAlbumForm()
    } catch (err) {
      console.error("Error updating album:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteItem = (item: MediaItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  // 🔧 now calls backend DELETE /media/items/:id
  const confirmDelete = async () => {
    if (!itemToDelete) {
      setDeleteDialogOpen(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/media/items/${itemToDelete.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error(await res.text())
      const result = await res.json()

      if (result?.success) {
        setMediaItems((prev) => prev.filter((item) => item.id !== itemToDelete.id))
        setAlbums((prev) =>
          prev.map((a) =>
            a.id === itemToDelete.albumId
              ? { ...a, itemCount: Math.max(0, (a.itemCount ?? 0) - 1) }
              : a,
          ),
        )
      }
    } catch (err) {
      console.error("Failed to delete media:", err)
    } finally {
      setItemToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    let items = selectedAlbum === "all" ? mediaItems : mediaItems.filter((item) => item.albumId === selectedAlbum)

    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    return items
  }, [mediaItems, selectedAlbum, searchQuery])

  // ===== Render =====
  return (
    <AppShell title="Media Sharing">
      {/* Hero header (same design) */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-white/20 shadow-2xl mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600  to-pink-600 opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <div className="absolute top-8 right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse opacity-60" />
        <div className="absolute bottom-12 left-12 w-28 h-28 bg-white/5 rounded-full blur-xl animate-bounce opacity-40" />
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white/15 rounded-full blur-lg animate-pulse delay-1000 opacity-50" />
        <div className="absolute top-20 left-1/3 w-16 h-16 bg-yellow-300/20 rounded-full blur-md animate-ping opacity-30" />
        <div className="absolute bottom-20 right-1/3 w-12 h-12 bg-blue-300/20 rounded-full blur-sm animate-bounce delay-500 opacity-40" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-16 left-20 w-2 h-2 bg-yellow-300 rounded-full animate-float opacity-70" />
          <div className="absolute top-32 right-24 w-1.5 h-1.5 bg-blue-300 rounded-full animate-float-delayed opacity-60" />
          <div className="absolute bottom-24 left-32 w-2.5 h-2.5 bg-green-300 rounded-full animate-float-slow opacity-50" />
          <div className="absolute bottom-16 right-16 w-1 h-1 bg-purple-300 rounded-full animate-float opacity-80" />
        </div>

        <div className="relative p-8 md:p-16 text-white">
          <div className="flex items-start gap-6">
            <div className="inline-flex h-20 w-20 items-center justify-center bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 animate-bounce group-hover:animate-pulse transition-all duration-500">
              <Camera className="h-10 w-10 text-white drop-shadow-2xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-5xl md:text-7xl font-black leading-tight bg-gradient-to-r from-white via-pink-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl mb-4">
                Media Gallery
              </h1>
              <p className="text-xl md:text-2xl text-pink-50/90 font-medium mb-6 leading-relaxed">
                Capture, organize, and share precious moments securely with families
              </p>
              <div className="flex items-center gap-8 text-pink-100/80">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-sm font-semibold">Photos</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Video className="h-6 w-6" />
                  <span className="text-sm font-semibold">Videos</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Sparkles className="h-6 w-6" />
                  <span className="text-sm font-semibold">Memories</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Section title="Photos & Videos" description="Capture and share precious moments securely with families.">
        {/* Control Panel */}
        <div className="bg-gradient-to-r from-white via-purple-50/50 to-pink-50/50 rounded-3xl border-2 border-purple-100/50 p-6 mb-8 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex gap-4">
              <Button
                onClick={() => setUploadDialogOpen(true)}
                disabled={isLoading}
                className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-3 text-base font-semibold"
              >
                <Upload className="h-5 w-5 mr-2" />
                {isLoading ? "Uploading..." : "Upload Media"}
              </Button>
              <Button
                onClick={() => setAlbumDialogOpen(true)}
                variant="outline"
                className="border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 px-6 py-3 text-base font-semibold bg-white/80 backdrop-blur-sm"
              >
                <FolderPlus className="h-5 w-5 mr-2 text-purple-600" />
                Create Album
              </Button>
            </div>

            <div className="flex gap-4 ml-auto">
              <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                <SelectTrigger className="w-56 h-12 border-2 border-purple-200 focus:border-purple-400">
                  {selectedAlbum === "all" ? "All Albums" : albums.find((a) => a.id === selectedAlbum)?.name}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Albums</SelectItem>
                  {albums.map((album) => (
                    <SelectItem key={album.id} value={album.id} className="hover:bg-purple-50">
                      {album.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Search media..."
                className="h-12 border-2 border-purple-200 focus:border-purple-400 bg-white/90 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="border-2 border-purple-200 hover:bg-purple-50"
              >
                {viewMode === "grid" ? "List" : "Grid"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Header */}
        <div className="mb-4 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-3xl p-8 border-2 border-purple-100/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedAlbum === "all" ? (
                  <span className="flex items-center gap-2">🎨 Complete Media Collection</span>
                ) : (
                  <span className="flex items-center gap-2">
                    📁 {albums.find((a) => a.id === selectedAlbum)?.name} Album
                  </span>
                )}
              </h3>
              <p className="text-purple-600 font-semibold text-lg">
                {filteredItems.length} items available
                {searchQuery && (
                  <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Filtered by: "{searchQuery}"
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 text-base font-bold shadow-lg">
                  {filteredItems.filter((i) => i.type === "image").length}
                </Badge>
                <p className="text-sm text-gray-600 mt-1 font-medium">Photos</p>
              </div>
              <div className="text-center">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 text-base font-bold shadow-lg">
                  {filteredItems.filter((i) => i.type === "video").length}
                </Badge>
                <p className="text-sm text-gray-600 mt-1 font-medium">Videos</p>
              </div>
              <div className="text-center">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 text-base font-bold shadow-lg">
                  {albums.length}
                </Badge>
                <p className="text-sm text-gray-600 mt-1 font-medium">Albums</p>
              </div>
            </div>
          </div>
        </div>

        {/* Album bar */}
        {albums.length > 0 && (
          <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedAlbum("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap ${
                selectedAlbum === "all"
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              All media
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{mediaItems.length}</span>
            </button>

            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => setSelectedAlbum(album.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap ${
                  selectedAlbum === album.id
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {album.isPublic ? "🌍" : "🔒"} {album.name}
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs">
                  {album.itemCount ?? 0}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-purple-200">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-purple-700 font-medium">Loading media...</span>
            </div>
          </div>
        )}

        {/* Media Display */}
        {!isLoading && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-purple-100/50 overflow-hidden hover:shadow-2xl hover:border-purple-300 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.title || ""}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 bg-black"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute top-4 left-4">
                        {item.type === "video" ? (
                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl flex items-center gap-2 px-3 py-1.5 text-sm font-semibold">
                            <Play className="h-4 w-4" />
                            Video
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl flex items-center gap-2 px-3 py-1.5 text-sm font-semibold">
                            <ImageIcon className="h-4 w-4" />
                            Photo
                          </Badge>
                        )}
                      </div>

                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setViewingItem(item)}
                          className="h-10 w-10 p-0 bg-white/90 hover:bg-white rounded-full shadow-lg backdrop-blur-sm border border-white/50"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item)}
                          className="h-10 w-10 p-0 bg-white/90 hover:bg-red-50 rounded-full shadow-lg backdrop-blur-sm border border-white/50"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h4 className="font-bold text-white text-base truncate mb-2">{item.title || "Untitled"}</h4>
                        <div className="flex items-center justify-between text-sm text-white/90">
                          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                            {new Date(item.uploadDate).toLocaleDateString()}
                          </span>
                          {item.type === "video" && (
                            <div className="flex items-center gap-2 bg-blue-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
                              <Film className="h-3 w-3" />
                              <span className="font-medium">Video</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-8 p-8 bg-gradient-to-r from-white via-purple-50/30 to-pink-50/30 rounded-3xl border-2 border-purple-100/50 hover:shadow-2xl hover:border-purple-300 transition-all duration-500 backdrop-blur-sm"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl border-2 border-white/50">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.title || ""}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 bg-black"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h4 className="font-bold text-xl text-gray-800">{item.title || "Untitled"}</h4>
                        {item.type === "video" ? (
                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 text-sm font-semibold">
                            <Video className="h-4 w-4 mr-1" />
                            Video
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 text-sm font-semibold">
                            <ImageIcon className="h-4 w-4 mr-1" />
                            Photo
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2 text-base">{item.description || "No description available"}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-purple-600 font-semibold bg-purple-100 px-3 py-1 rounded-full">
                          Uploaded: {new Date(item.uploadDate).toLocaleDateString()}
                        </span>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-2">
                            {item.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewingItem(item)}
                        className="h-12 w-12 p-0 bg-blue-50 hover:bg-blue-100 rounded-full shadow-lg border-2 border-blue-200"
                      >
                        <Eye className="h-5 w-5 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteItem(item)}
                        className="h-12 w-12 p-0 bg-red-50 hover:bg-red-100 rounded-full shadow-lg border-2 border-red-200"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl border-2 border-purple-100/50 shadow-lg">
            <div className="w-40 h-40 bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl">
              <Camera className="h-20 w-20 text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Media Found</h3>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
              {searchQuery ? (
                <>No media matches your search "{searchQuery}". Try different keywords or clear the search.</>
              ) : selectedAlbum === "all" ? (
                <>Start capturing memories by uploading your first photos or videos to share with families.</>
              ) : (
                <>This album is waiting for its first memories. Upload some content to get started.</>
              )}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setUploadDialogOpen(true)}
                className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white border-0 shadow-2xl transition-all duration-300 px-8 py-3 text-lg font-semibold"
              >
                <Upload className="h-6 w-6 mr-2" />
                Upload Your First Media
              </Button>
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="border-2 border-gray-300 hover:bg-gray-50 px-6 py-3 text-lg font-semibold"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Media Viewer Dialog */}
        <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
          <DialogContent className="max-w-6xl w-full p-0 bg-gray-900/70 backdrop-blur-2xl border-white/10 text-pink-700 rounded-3xl shadow-2xl overflow-hidden">
            {viewingItem && (
              <div>
                <DialogHeader className="p-6 border-b border-white/10">
                  <DialogTitle className="text-2xl font-bold">{viewingItem.title || "Media Viewer"}</DialogTitle>
                </DialogHeader>
                <DialogBody className="p-2 sm:p-4 md:p-6 flex justify-center items-center">
                  {viewingItem.type === "image" ? (
                    <img
                      src={viewingItem.url}
                      alt={viewingItem.title || ""}
                      className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
                    />
                  ) : (
                    <video
                      src={viewingItem.url}
                      controls
                      autoPlay
                      className="w-full h-auto max-h-[75vh] object-contain rounded-xl bg-black"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </DialogBody>
                {viewingItem.description && (
                  <DialogFooter className="p-6 bg-black/20 border-t border-white/10">
                    <DialogDescription className="text-base text-white/80">
                      {viewingItem.description}
                    </DialogDescription>
                  </DialogFooter>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-3xl border-0 shadow-2xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 backdrop-blur-sm">
            <DialogHeader className="pb-8">
              <DialogTitle className="flex items-center gap-4 text-3xl">
                <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl shadow-xl">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                Upload Media
              </DialogTitle>
              <DialogDescription className="text-lg text-gray-600 mt-3">
                Share photos and videos with families. Supported formats: JPG, PNG, MP4, MOV.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadSubmit}>
              <DialogBody className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="file" className="text-lg font-bold text-gray-700">
                    Select File *
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    required
                    className="h-14 border-2 border-purple-200 focus:border-purple-400 bg-white/90 backdrop-blur-sm text-base"
                  />
                  {uploadFormData.files.length > 0 && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                      <p className="text-base text-purple-700 font-semibold">
                        📁 Selected: {uploadFormData.files.map((file) => file.name).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="album" className="text-lg font-bold text-gray-700">
                    Album *
                  </Label>
                  <Select
                    value={uploadFormData.albumId}
                    onValueChange={(value) => setUploadFormData((prev) => ({ ...prev, albumId: value }))}
                  >
                    <SelectTrigger className="h-14 border-2 border-purple-200 focus:border-purple-400 bg-white/90 backdrop-blur-sm text-base">
                      {uploadFormData.albumId
                        ? albums.find((a) => a.id === uploadFormData.albumId)?.name
                        : "Select album"}
                    </SelectTrigger>
                    <SelectContent>
                      {albums.map((album) => (
                        <SelectItem key={album.id} value={album.id} className="hover:bg-purple-50 text-base py-3">
                          <div className="flex items-center gap-3">
                            <span>📁</span>
                            <span>{album.name}</span>
                            {album.isPublic ? (
                              <Globe className="h-4 w-4 text-green-500" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-lg font-bold text-gray-700">Title</Label>
                    <Input
                      value={uploadFormData.title}
                      onChange={(e) => setUploadFormData((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Give your media a memorable title..."
                      className="h-14 border-2 border-purple-200 focus:border-purple-400 bg-white/90 backdrop-blur-sm text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-lg font-bold text-gray-700">Tags</Label>
                    <Input
                      value={uploadFormData.tags}
                      onChange={(e) => setUploadFormData((p) => ({ ...p, tags: e.target.value }))}
                      placeholder="art, outdoor, playtime (comma separated)"
                      className="h-14 border-2 border-purple-200 focus:border-purple-400 bg-white/90 backdrop-blur-sm text-base"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-lg font-bold text-gray-700">Description</Label>
                  <Textarea
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe what's happening in this moment..."
                    className="min-h-[120px] border-2 border-purple-200 focus:border-purple-400 bg-white/90 backdrop-blur-sm resize-none text-base"
                  />
                </div>
              </DialogBody>
              <DialogFooter className="pt-8 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                  className="border-2 border-gray-300 hover:bg-gray-50 px-8 py-3 text-base font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-3 text-base font-semibold"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Media
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create Album Dialog */}
        <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
          <DialogContent className="max-w-2xl border-0 shadow-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 backdrop-blur-sm">
            <DialogHeader className="pb-8">
              <DialogTitle className="flex items-center gap-4 text-3xl">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl">
                  <FolderPlus className="h-8 w-8 text-white" />
                </div>
                Create Album
              </DialogTitle>
              <DialogDescription className="text-lg text-gray-600 mt-3">
                Create a new album to organize your photos and videos.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAlbum}>
              <DialogBody className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-lg font-bold text-gray-700">Album Name *</Label>
                  <Input
                    placeholder="Enter a creative album name..."
                    value={albumFormData.name}
                    onChange={(e) => setAlbumFormData((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="h-14 border-2 border-green-200 focus:border-green-400 bg-white/90 backdrop-blur-sm text-base"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-lg font-bold text-gray-700">Description</Label>
                  <Textarea
                    placeholder="Describe what this album will contain..."
                    value={albumFormData.description}
                    onChange={(e) => setAlbumFormData((p) => ({ ...p, description: e.target.value }))}
                    className="min-h-[120px] border-2 border-green-200 focus:border-green-400 bg-white/90 backdrop-blur-sm resize-none text-base"
                  />
                </div>
                <div className="flex items-center gap-4 p-6 bg-green-50 rounded-2xl border-2 border-green-200">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={albumFormData.isPublic}
                    onChange={(e) => setAlbumFormData((p) => ({ ...p, isPublic: e.target.checked }))}
                    className="w-6 h-6 text-green-600 rounded focus:ring-green-500"
                  />
                  <Label
                    htmlFor="isPublic"
                    className="text-lg font-semibold text-gray-700 cursor-pointer flex items-center gap-2"
                  >
                    {albumFormData.isPublic ? (
                      <Globe className="h-5 w-5 text-green-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-500" />
                    )}
                    Make this album public (visible to all families)
                  </Label>
                </div>
              </DialogBody>
              <DialogFooter className="pt-8 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAlbumDialogOpen(false)}
                  className="border-2 border-gray-300 hover:bg-gray-50 px-8 py-3 text-base font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-3 text-base font-semibold"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FolderPlus className="h-5 w-5 mr-2" />
                      Create Album
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="border-0 shadow-2xl bg-gradient-to-br from-white via-red-50/30 to-pink-50/30 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-4 text-2xl text-red-700">
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-xl">
                  <Trash2 className="h-6 w-6 text-white" />
                </div>
                Delete Media Item
              </AlertDialogTitle>
              <AlertDialogDescription className="text-lg text-gray-600 mt-3">
                Are you sure you want to permanently delete "{itemToDelete?.title || "this item"}"? This action cannot
                be undone and will remove the media from all shared locations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-4 pt-6">
              <AlertDialogCancel className="border-2 border-gray-300 hover:bg-gray-50 px-6 py-3 text-base font-semibold">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-6 py-3 text-base font-semibold"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Delete Media
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 4s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 5s ease-in-out infinite; }
      `}</style>
    </AppShell>
  )
}
