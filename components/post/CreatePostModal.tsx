"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * @file CreatePostModal.tsx
 * @description 게시물 작성 모달 컴포넌트
 *
 * 주요 기능:
 * 1. 이미지 선택 및 미리보기 (1:1 비율)
 * 2. 캡션 입력 (최대 2,200자)
 * 3. 게시물 업로드
 *
 * @dependencies
 * - shadcn/ui Dialog, Button, Textarea
 * - lucide-react 아이콘
 */

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

const MAX_CAPTION_LENGTH = 2200;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function CreatePostModal({
  open,
  onOpenChange,
  onPostCreated,
}: CreatePostModalProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      setError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // MIME 타입 검증
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError("JPEG, PNG, WebP 형식만 업로드 가능합니다.");
      return;
    }

    setSelectedImage(file);
    setError(null);

    // 미리보기 URL 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 게시물 업로드
  const handleUpload = async () => {
    if (!selectedImage) {
      setError("이미지를 선택해주세요.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("caption", caption);

      let response: Response;
      try {
        response = await fetch("/api/posts", {
          method: "POST",
          body: formData,
        });
      } catch {
        throw new Error("인터넷 연결을 확인해주세요.");
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "업로드에 실패했습니다.");
      }

      // 성공 시 모달 닫기 및 상태 초기화
      handleClose();
      
      // 피드 새로고침
      if (onPostCreated) {
        onPostCreated();
      } else {
        // 기본 동작: 페이지 새로고침
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // 모달 닫기 및 상태 초기화
  const handleClose = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setCaption("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[600px] p-0"
        aria-describedby="create-post-description"
      >
        <DialogHeader className="px-6 py-4 border-b border-[var(--instagram-border)]">
          <DialogTitle className="text-center font-semibold">
            새 게시물 만들기
          </DialogTitle>
          <p id="create-post-description" className="sr-only">
            이미지를 선택하고 캡션을 입력하여 새 게시물을 만듭니다.
          </p>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* 이미지 선택 영역 */}
          {!previewUrl ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--instagram-border)] rounded-lg p-12">
              <ImageIcon className="w-16 h-16 text-[var(--instagram-text-secondary)] mb-4" />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mb-2"
              >
                사진 선택
              </Button>
              <p className="text-sm text-[var(--instagram-text-secondary)]">
                JPEG, PNG, WebP (최대 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-[var(--instagram-background)] relative">
                <Image
                  src={previewUrl}
                  alt="미리보기"
                  fill
                  className="object-cover"
                  sizes="600px"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* 캡션 입력 영역 */}
          <div className="space-y-2">
            <Textarea
              placeholder="문구 입력..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={MAX_CAPTION_LENGTH}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-end">
              <span
                className={`text-xs ${
                  caption.length > MAX_CAPTION_LENGTH * 0.9
                    ? "text-red-500"
                    : "text-[var(--instagram-text-secondary)]"
                }`}
              >
                {caption.length}/{MAX_CAPTION_LENGTH}
              </span>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 업로드 버튼 */}
          <Button
            onClick={handleUpload}
            disabled={!selectedImage || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                업로드 중...
              </>
            ) : (
              "공유하기"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

