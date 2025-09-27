"use client"

import React, { useEffect } from "react"
import { AppShell, Section } from "../components/app-shell"
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
  Edit,
  Download,
  Eye,
  Share,
  Calendar,
  Play,
  Film,
  Sparkles,
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
  coverImage: string
  createdDate: string
  itemCount: number
  isPublic: boolean
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
      try {
        const res = await fetch("http://localhost:8080/media/albums")
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setAlbums(Array.isArray(data) ? data : [data])
      } catch (err) {
        console.error("Albums fetch error:", err)
        setAlbums([])
      }
    }

    const fetchMedia = async () => {
      try {
        const res = await fetch("http://localhost:8080/media/items")
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
  }, [])

  // ===== Handlers =====
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadFormData(prev => ({ ...prev, files }))
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("file", uploadFormData.files[0])
    formData.append("albumId", uploadFormData.albumId)
    formData.append("title", uploadFormData.title)
    formData.append("description", uploadFormData.description)
    formData.append("tags", uploadFormData.tags)

    try {
      const res = await fetch("http://localhost:8080/media/items", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error(await res.text())
      const savedItems = await res.json()
      setMediaItems(prev => [...prev, ...savedItems]) // UI update
      resetUploadForm()
      setUploadDialogOpen(false)
    } catch (err) {
      console.error("Upload failed:", err)
    }
  }


  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("http://localhost:8080/media/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(albumFormData),
      })
      if (!res.ok) throw new Error(await res.text())
      const savedAlbum = await res.json()
      setAlbums(prev => [...prev, savedAlbum]) // UI update
      resetAlbumForm()
      setAlbumDialogOpen(false)
    } catch (err) {
      console.error("Error creating album:", err)
    }
  }


  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album)
    setAlbumFormData({ name: album.name, description: album.description, isPublic: album.isPublic })
    setEditAlbumDialogOpen(true)
  }

  const handleUpdateAlbum = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAlbum) {
      setAlbums(prev => prev.map(a => a.id === editingAlbum.id ? { ...a, ...albumFormData } : a))
    }
    setEditingAlbum(null)
    resetAlbumForm()
    setEditAlbumDialogOpen(false)
  }

  const handleDeleteItem = (item: MediaItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      setMediaItems(prev => prev.filter(item => item.id !== itemToDelete.id))
      setAlbums(prev => prev.map(a => a.id === itemToDelete.albumId ? { ...a, itemCount: Math.max(0, a.itemCount - 1) } : a))
      setItemToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const filteredItems = selectedAlbum === "all" ? mediaItems : mediaItems.filter(item => item.albumId === selectedAlbum)

  // ===== Fetch albums & media =====
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await fetch("http://localhost:8080/media/albums")
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setAlbums(Array.isArray(data) ? data : [data])
      } catch (err) {
        console.error("Albums fetch error:", err)
        setAlbums([])
      }
    }

    const fetchMedia = async () => {
      try {
        const url =
          selectedAlbum === "all"
            ? "http://localhost:8080/media/items"
            : `http://localhost:8080/media/items?albumId=${selectedAlbum}`

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


  // ===== Render =====
  return (
    <AppShell title="Media Sharing">
      {/* Enhanced Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Floating decorative elements */}
        <div className="absolute top-6 right-8 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-8 left-8 w-20 h-20 bg-white/5 rounded-full blur-lg animate-bounce" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/10 rounded-full blur-md animate-pulse delay-1000" />

        <div className="relative p-8 md:p-12 text-white">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-16 w-16 items-center justify-center bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 animate-bounce">
              <Camera className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent drop-shadow-lg">
                Media Sharing
              </h1>
              <p className="mt-3 text-xl text-pink-50/90 font-medium">
                Capture, organize, and share precious moments securely with families
              </p>
              <div className="flex items-center gap-6 mt-4 text-pink-100/80">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Photos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  <span className="text-sm font-medium">Videos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">Memories</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Section title="Photos & Videos" description="Capture and share precious moments securely with families.">
        {/* Enhanced Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-3">
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Media
            </Button>
            <Button
              onClick={() => setAlbumDialogOpen(true)}
              variant="outline"
              className="border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
            >
              <FolderPlus className="h-5 w-5 mr-2 text-purple-600" />
              Create Album
            </Button>
          </div>

          <div className="flex gap-3 ml-auto">
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

            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="border-2 border-purple-200 hover:bg-purple-50"
            >
              {viewMode === "grid" ? " List" : " Grid"}
            </Button>
          </div>
        </div>

        {/* Enhanced Media Header */}
        <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {selectedAlbum === "all"
                ? "🎨 All Media Collection"
                : `📁 ${albums.find((a) => a.id === selectedAlbum)?.name} Album`}
            </h3>
            <p className="text-purple-600 font-medium mt-1">{filteredItems.length} items available</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-semibold">
              {filteredItems.filter((i) => i.type === "image").length} Photos
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm font-semibold">
              {filteredItems.filter((i) => i.type === "video").length} Videos
            </Badge>
          </div>
        </div>

        {/* Media Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-2xl border-2 border-purple-100 overflow-hidden hover:shadow-2xl hover:border-purple-300 transition-all duration-300 transform hover:scale-105"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src="/galerie.jpg"
                    alt={item.title || ""}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Type indicator */}
                  <div className="absolute top-3 left-3">
                    {item.type === "video" ? (
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        Video
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        Photo
                      </Badge>
                    )}
                  </div>

                  {/* Action buttons */}

                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(item.url, "_blank")}
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-red-100 rounded-full shadow-lg"
                    >
                      <Eye className="h-5 w-5 text-emerald-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteItem(item)}
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-red-100 rounded-full shadow-lg"
                    >
                      <Trash2 className="h-3 w-3 text-pink-600" />
                    </Button>
                  </div>

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    <h4 className="font-semibold text-white text-sm truncate mb-1">{item.title}</h4>
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span className="bg-white/20 px-2 py-1 rounded-full">{item.uploadDate}</span>
                      {item.type === "video" && (
                        <div className="flex items-center gap-1 bg-blue-500/80 px-2 py-1 rounded-full">
                          <Film className="h-3 w-3" />
                          <span>Video</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-6 p-6 bg-gradient-to-r from-white to-purple-50/30 rounded-2xl border-2 border-purple-100 hover:shadow-xl hover:border-purple-300 transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                  <img
                    src="/galerie.jpg"
                    alt={item.title || ""}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-lg text-gray-800">{item.title}</h4>
                    {item.type === "video" ? (
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Photo
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-1">{item.description}</p>
                  <p className="text-sm text-purple-600 font-medium">Uploaded: {item.uploadDate}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(item.url, "_blank")}
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-emerald-100 rounded-full shadow-lg"
                >
                  <Eye className="h-3 w-3 text-pink-600" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteItem(item)}
                  className="h-12 w-12 p-0 hover:bg-red-100 hover:scale-110 transition-all duration-200 rounded-full"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </Button>
              </div>

            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-100">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Camera className="h-16 w-16 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Media Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {selectedAlbum === "all"
                ? "Start capturing memories by uploading your first photos or videos to share with families."
                : "This album is waiting for its first memories. Upload some content to get started."}
            </p>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Your First Media
            </Button>
          </div>
        )}

        {/* Enhanced Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-2xl border-0 shadow-2xl bg-gradient-to-br from-white to-purple-50/30">
            <DialogHeader className="pb-6">
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                Upload Media
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-2">
                Share photos and videos with families. Supported formats: JPG, PNG, MP4, MOV.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadSubmit}>
              <DialogBody className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-base font-semibold text-gray-700">
                    Select File *
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    required
                    className="h-12 border-2 border-purple-200 focus:border-purple-400 bg-white"
                  />
                  {uploadFormData.files.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-700 font-medium">
                        📁 Selected: {uploadFormData.files.map((file) => file.name).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="album" className="text-base font-semibold text-gray-700">
                    Album *
                  </Label>
                  <Select
                    value={uploadFormData.albumId}
                    onValueChange={(value) => setUploadFormData((prev) => ({ ...prev, albumId: value }))}
                  >
                    <SelectTrigger className="h-12 border-2 border-purple-200 focus:border-purple-400 bg-white">
                      {uploadFormData.albumId
                        ? albums.find((a) => a.id === uploadFormData.albumId)?.name
                        : "Select album"}
                    </SelectTrigger>
                    <SelectContent>
                      {albums.map((album) => (
                        <SelectItem key={album.id} value={album.id} className="hover:bg-purple-50">
                          📁 {album.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700">Title</Label>
                  <Input
                    value={uploadFormData.title}
                    onChange={(e) => setUploadFormData((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Give your media a memorable title..."
                    className="h-12 border-2 border-purple-200 focus:border-purple-400 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700">Description</Label>
                  <Textarea
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe what's happening in this moment..."
                    className="min-h-[100px] border-2 border-purple-200 focus:border-purple-400 bg-white resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700">Tags</Label>
                  <Input
                    value={uploadFormData.tags}
                    onChange={(e) => setUploadFormData((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="art, outdoor, playtime (comma separated)"
                    className="h-12 border-2 border-purple-200 focus:border-purple-400 bg-white"
                  />
                </div>
              </DialogBody>
              <DialogFooter className="pt-6 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                  className="border-2 border-gray-300 hover:bg-gray-50 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 px-8"
                >
                  Upload Media
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Enhanced Album Dialog */}
        <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
          <DialogContent className="border-0 shadow-2xl bg-gradient-to-br from-white to-purple-50/30">
            <DialogHeader className="pb-6">
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <FolderPlus className="h-6 w-6 text-white" />
                </div>
                Create Album
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-2">
                Create a new album to organize your photos and videos.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAlbum}>
              <DialogBody className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700">Album Name *</Label>
                  <Input
                    placeholder="Enter a creative album name..."
                    value={albumFormData.name}
                    onChange={(e) => setAlbumFormData((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="h-12 border-2 border-purple-200 focus:border-purple-400 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700">Description</Label>
                  <Textarea
                    placeholder="Describe what this album will contain..."
                    value={albumFormData.description}
                    onChange={(e) => setAlbumFormData((p) => ({ ...p, description: e.target.value }))}
                    className="min-h-[100px] border-2 border-purple-200 focus:border-purple-400 bg-white resize-none"
                  />
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={albumFormData.isPublic}
                    onChange={(e) => setAlbumFormData((p) => ({ ...p, isPublic: e.target.checked }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <Label htmlFor="isPublic" className="text-base font-medium text-gray-700 cursor-pointer">
                    🌍 Make this album public (visible to all families)
                  </Label>
                </div>
              </DialogBody>
              <DialogFooter className="pt-6 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAlbumDialogOpen(false)}
                  className="border-2 border-gray-300 hover:bg-gray-50 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 px-8"
                >
                  Create Album
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Enhanced Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="border-0 shadow-2xl bg-gradient-to-br from-white to-red-50/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3 text-xl text-red-700">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                  <Trash2 className="h-5 w-5 text-white" />
                </div>
                Delete Media Item
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base text-gray-600 mt-2">
                Are you sure you want to permanently delete "{itemToDelete?.title}"? This action cannot be undone and
                will remove the media from all shared locations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="border-3 border-gray-300 hover:bg-gray-50">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Delete Media
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>
    </AppShell>
  )
}