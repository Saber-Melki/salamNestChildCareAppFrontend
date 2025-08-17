"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
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
} from "lucide-react"

type MediaItem = {
  id: string
  type: "image" | "video"
  url: string
  title: string
  description: string
  albumId: string
  uploadDate: string
  tags: string[]
  sharedWith: string[]
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
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
  const [albumDialogOpen, setAlbumDialogOpen] = React.useState(false)
  const [editAlbumDialogOpen, setEditAlbumDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedAlbum, setSelectedAlbum] = React.useState<string>("all")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [editingAlbum, setEditingAlbum] = React.useState<Album | null>(null)
  const [itemToDelete, setItemToDelete] = React.useState<MediaItem | null>(null)

  const [albums, setAlbums] = React.useState<Album[]>([
    {
      id: "1",
      name: "Morning Activities",
      description: "Daily morning circle time and activities",
      coverImage: "/classroom-moment.png",
      createdDate: "2024-01-15",
      itemCount: 12,
      isPublic: true,
    },
    {
      id: "2",
      name: "Art Projects",
      description: "Creative artwork and craft projects",
      coverImage: "/classroom-moment.png",
      createdDate: "2024-01-20",
      itemCount: 8,
      isPublic: false,
    },
    {
      id: "3",
      name: "Outdoor Play",
      description: "Playground and outdoor activities",
      coverImage: "/classroom-moment.png",
      createdDate: "2024-01-25",
      itemCount: 15,
      isPublic: true,
    },
  ])

  const [mediaItems, setMediaItems] = React.useState<MediaItem[]>([
    {
      id: "1",
      type: "image",
      url: "/classroom-moment.png",
      title: "Circle Time Fun",
      description: "Children enjoying morning circle time",
      albumId: "1",
      uploadDate: "2024-01-15",
      tags: ["circle-time", "morning", "group-activity"],
      sharedWith: ["Johnson", "Garcia", "Chen"],
    },
    {
      id: "2",
      type: "image",
      url: "/classroom-moment.png",
      title: "Art Creation",
      description: "Beautiful finger painting session",
      albumId: "2",
      uploadDate: "2024-01-20",
      tags: ["art", "painting", "creative"],
      sharedWith: ["Smith", "Williams"],
    },
    {
      id: "3",
      type: "video",
      url: "/classroom-moment.png",
      title: "Playground Adventures",
      description: "Kids playing on the swings and slides",
      albumId: "3",
      uploadDate: "2024-01-25",
      tags: ["outdoor", "playground", "physical-activity"],
      sharedWith: ["Johnson", "Garcia"],
    },
  ])

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

  const resetUploadForm = () => {
    setUploadFormData({
      files: [],
      albumId: "",
      title: "",
      description: "",
      tags: "",
      shareWith: [],
    })
  }

  const resetAlbumForm = () => {
    setAlbumFormData({
      name: "",
      description: "",
      isPublic: true,
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadFormData((prev) => ({ ...prev, files }))
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    uploadFormData.files.forEach((file, index) => {
      const newItem: MediaItem = {
        id: `${Date.now()}-${index}`,
        type: file.type.startsWith("video/") ? "video" : "image",
        url: URL.createObjectURL(file), // In real app, this would be uploaded to server
        title: uploadFormData.title || file.name,
        description: uploadFormData.description,
        albumId: uploadFormData.albumId || "1",
        uploadDate: new Date().toISOString().split("T")[0],
        tags: uploadFormData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        sharedWith: uploadFormData.shareWith,
      }

      setMediaItems((prev) => [...prev, newItem])

      // Update album item count
      setAlbums((prev) =>
        prev.map((album) => (album.id === newItem.albumId ? { ...album, itemCount: album.itemCount + 1 } : album)),
      )
    })

    resetUploadForm()
    setUploadDialogOpen(false)
  }

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault()

    const newAlbum: Album = {
      id: Date.now().toString(),
      name: albumFormData.name,
      description: albumFormData.description,
      coverImage: "/classroom-moment.png",
      createdDate: new Date().toISOString().split("T")[0],
      itemCount: 0,
      isPublic: albumFormData.isPublic,
    }

    setAlbums((prev) => [...prev, newAlbum])
    resetAlbumForm()
    setAlbumDialogOpen(false)
  }

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album)
    setAlbumFormData({
      name: album.name,
      description: album.description,
      isPublic: album.isPublic,
    })
    setEditAlbumDialogOpen(true)
  }

  const handleUpdateAlbum = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingAlbum) {
      setAlbums((prev) =>
        prev.map((album) =>
          album.id === editingAlbum.id
            ? {
                ...album,
                name: albumFormData.name,
                description: albumFormData.description,
                isPublic: albumFormData.isPublic,
              }
            : album,
        ),
      )
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
      setMediaItems((prev) => prev.filter((item) => item.id !== itemToDelete.id))

      // Update album item count
      setAlbums((prev) =>
        prev.map((album) =>
          album.id === itemToDelete.albumId ? { ...album, itemCount: Math.max(0, album.itemCount - 1) } : album,
        ),
      )

      setItemToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const filteredItems =
    selectedAlbum === "all" ? mediaItems : mediaItems.filter((item) => item.albumId === selectedAlbum)

  const families = ["Johnson", "Garcia", "Chen", "Smith", "Williams"]

  return (
    <AppShell title="Media Sharing">
      <Section title="Photos & Videos" description="Share moments securely with parents.">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-400 text-white border-0 shadow-lg hover:shadow-xl transition-all"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
            <Button
              onClick={() => setAlbumDialogOpen(true)}
              variant="outline"
              className="border-blue-200 hover:bg-blue-50"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Album
            </Button>
          </div>

          <div className="flex gap-2 ml-auto">
            <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
              <SelectTrigger className="w-48">
                {selectedAlbum === "all" ? "All Albums" : albums.find((a) => a.id === selectedAlbum)?.name}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Albums</SelectItem>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.name} ({album.itemCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
              {viewMode === "grid" ? "List" : "Grid"}
            </Button>
          </div>
        </div>

        {/* Albums Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Albums</h3>
            <div className="text-sm text-gray-500">{albums.length} albums</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {albums.map((album) => (
              <div
                key={album.id}
                className="group relative bg-white/70 rounded-xl border overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    // src={album.coverImage || "/placeholder.svg"}
                    src={"/garderie.jpg"}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h4 className="font-medium text-white text-sm truncate">{album.name}</h4>
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span>{album.itemCount} items</span>
                      <div className="flex items-center gap-1">
                        {album.isPublic && (
                          <Badge variant="secondary" className="text-xs">
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{album.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {album.createdDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditAlbum(album)}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                      >
                        <Edit className="h-3 w-3 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedAlbum(album.id)}
                        className="h-6 w-6 p-0 hover:bg-green-100"
                      >
                        <Eye className="h-3 w-3 text-green-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Items */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              {selectedAlbum === "all" ? "All Media" : `${albums.find((a) => a.id === selectedAlbum)?.name} Media`}
            </h3>
            <div className="text-sm text-gray-500">{filteredItems.length} items</div>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white/70 rounded-xl border overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    // src={item.url || "/placeholder.svg"}
                    src={"/garderie.jpg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    {item.type === "video" ? (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        Video
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        Photo
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 bg-white/80 hover:bg-white">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 bg-white/80 hover:bg-white">
                        <Share className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteItem(item)}
                        className="h-6 w-6 p-0 bg-white/80 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <h4 className="font-medium text-white text-xs truncate">{item.title}</h4>
                    <div className="flex items-center gap-1 text-xs text-white/80">
                      <span>{item.uploadDate}</span>
                      {item.sharedWith.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Shared with {item.sharedWith.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-white/70 rounded-xl border hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                {/* <img src={item.url || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" /> */}
                <img src={"/garderie.jpg"} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    {item.type === "video" ? (
                      <Video className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1 mb-1">{item.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.uploadDate}</span>
                    <span>•</span>
                    <span>Shared with {item.sharedWith.join(", ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-100">
                    <Download className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-green-100">
                    <Share className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteItem(item)}
                    className="h-8 w-8 p-0 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No media found</h3>
            <p className="text-gray-500 mb-4">
              {selectedAlbum === "all"
                ? "Start by uploading some photos or videos to share with families."
                : "This album doesn't have any media yet. Upload some content to get started."}
            </p>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-400 text-white border-0"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </div>
        )}
      </Section>

      {/* Upload Media Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Media
            </DialogTitle>
            <DialogDescription>
              Upload photos and videos to share with families. Supported formats: JPG, PNG, MP4, MOV.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit}>
            <DialogBody className="space-y-4">
              <div>
                <Label htmlFor="files">Select Files *</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  required
                  className="mt-1"
                />
                {uploadFormData.files.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">{uploadFormData.files.length} file(s) selected</div>
                )}
              </div>

              <div>
                <Label htmlFor="album">Album *</Label>
                <Select
                  value={uploadFormData.albumId}
                  onValueChange={(value) => setUploadFormData((prev) => ({ ...prev, albumId: value }))}
                >
                  <SelectTrigger className="mt-1" placeholder="Select album">
                    {uploadFormData.albumId
                      ? albums.find((a) => a.id === uploadFormData.albumId)?.name
                      : "Select album"}
                  </SelectTrigger>
                  <SelectContent>
                    {albums.map((album) => (
                      <SelectItem key={album.id} value={album.id}>
                        {album.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={uploadFormData.title}
                  onChange={(e) => setUploadFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a title for the media..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what's happening in the media..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={uploadFormData.tags}
                  onChange={(e) => setUploadFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="art, outdoor, circle-time (comma separated)"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Share With Families</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {families.map((family) => (
                    <label key={family} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={uploadFormData.shareWith.includes(family)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUploadFormData((prev) => ({
                              ...prev,
                              shareWith: [...prev.shareWith, family],
                            }))
                          } else {
                            setUploadFormData((prev) => ({
                              ...prev,
                              shareWith: prev.shareWith.filter((f) => f !== family),
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      {family} Family
                    </label>
                  ))}
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0">
                Upload Media
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Album Dialog */}
      <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-green-600" />
              Create New Album
            </DialogTitle>
            <DialogDescription>Create a new album to organize your photos and videos.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAlbum}>
            <DialogBody className="space-y-4">
              <div>
                <Label htmlFor="albumName">Album Name *</Label>
                <Input
                  id="albumName"
                  value={albumFormData.name}
                  onChange={(e) => setAlbumFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter album name..."
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="albumDescription">Description</Label>
                <Textarea
                  id="albumDescription"
                  value={albumFormData.description}
                  onChange={(e) => setAlbumFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this album will contain..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={albumFormData.isPublic}
                  onChange={(e) => setAlbumFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isPublic" className="text-sm">
                  Make this album public (visible to all families)
                </Label>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAlbumDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-400 text-white border-0">
                Create Album
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Album Dialog */}
      <Dialog open={editAlbumDialogOpen} onOpenChange={setEditAlbumDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Album
            </DialogTitle>
            <DialogDescription>Update the album information and settings.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateAlbum}>
            <DialogBody className="space-y-4">
              <div>
                <Label htmlFor="editAlbumName">Album Name *</Label>
                <Input
                  id="editAlbumName"
                  value={albumFormData.name}
                  onChange={(e) => setAlbumFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter album name..."
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editAlbumDescription">Description</Label>
                <Textarea
                  id="editAlbumDescription"
                  value={albumFormData.description}
                  onChange={(e) => setAlbumFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this album contains..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsPublic"
                  checked={albumFormData.isPublic}
                  onChange={(e) => setAlbumFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="editIsPublic" className="text-sm">
                  Make this album public (visible to all families)
                </Label>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditAlbumDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0">
                Update Album
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone and the media will
              be removed from all shared locations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete Media</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
