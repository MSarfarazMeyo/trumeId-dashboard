import React, { useState, useRef, useEffect, useMemo } from "react";

import { Button, message } from "antd";
import {
  IoChevronDownCircleOutline,
  IoChevronUpCircleOutline,
} from "react-icons/io5";
import { CloseOutlined, PaperClipOutlined } from "@ant-design/icons";
import { FcDocument } from "react-icons/fc";
import { TbPhotoBitcoin } from "react-icons/tb";
import { GiPaperClip } from "react-icons/gi";
import { VerificationType } from "../types";

const NotesComponent = ({
  applicantId,
  applicant = null,
  uploadFile,
  createOrUpdateNote,
  isUploadPending = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noteCount, setNoteCount] = useState(0);

  const existingNotes = useMemo(() => {
    if (!applicant?.verificationResults) return null;

    return applicant.verificationResults.find(
      (result) => result.verificationType === VerificationType.CLIENT_NOTES
    );
  }, [applicant?.verificationResults]);

  const fileInputRef = useRef();
  const textareaRef = useRef();

  // Initialize component with existing notes data
  useEffect(() => {
    if (existingNotes) {
      setNoteText(existingNotes.rawResponse?.note || "");
      setAttachments(existingNotes.imagesMeta?.attachments || []);
      setNoteCount(existingNotes.rawResponse?.note ? 1 : 0);
    }
  }, [existingNotes]);

  // Auto-focus textarea when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      message.error("Only JPEG, PNG, and PDF files are allowed");
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      message.error("File size must be less than 10MB");
      return;
    }

    try {
      await uploadFile(
        { file: selectedFile },
        {
          onSuccess: (response) => {
            const newAttachment = {
              id: Date.now(), // Temporary ID for UI purposes
              name: selectedFile.name,
              type: selectedFile.type,
              size: selectedFile.size,
              url: response.url,
              key: response.key,
              uploadedAt: new Date().toISOString(),
            };

            setAttachments((prev) => [...prev, newAttachment]);
            message.success("File uploaded successfully");
          },
          onError: (error) => {
            console.error("File upload error:", error);
            message.error("Failed to upload file");
          },
        }
      );
    } catch (error) {
      console.error("File upload error:", error);
      message.error("Failed to upload file");
    }

    // Clear the input
    e.target.value = "";
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
  };

  const handleSubmitNote = async () => {
    if (!noteText.trim() && attachments.length === 0) {
      message.warning("Please add a note or attachment");
      return;
    }

    setIsSubmitting(true);

    try {
      await createOrUpdateNote(
        {
          applicantId,
          verificationType: VerificationType.CLIENT_NOTES,
          rawResponse: {
            note: noteText.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          imagesMeta: {
            attachments: attachments.map((att) => ({
              ...att,
              id: att.id || Date.now(),
            })),
          },
        },
        {
          onSuccess: () => {
            message.success(
              existingNotes
                ? "Note updated successfully"
                : "Note created successfully"
            );
            setNoteCount(noteText.trim() ? 1 : 0);
            setIsExpanded(false);
          },
          onError: (error) => {
            console.error("Failed to save note:", error);
            message.error("Failed to save note");
          },
        }
      );
    } catch (error) {
      console.error("Failed to save note:", error);
      message.error("Failed to save note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values if editing existing note
    if (existingNotes) {
      setNoteText(existingNotes.rawResponse?.note || "");
      setAttachments(existingNotes.imagesMeta?.attachments || []);
    } else {
      setNoteText("");
      setAttachments([]);
    }
    setIsExpanded(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <TbPhotoBitcoin className="w-4 h-4 text-blue-500" />;
    }
    return <FcDocument className="w-4 h-4 text-red-500" />;
  };

  const hasContent = noteText.trim() || attachments.length > 0;

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggleExpanded}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <IoChevronUpCircleOutline className="w-4 h-4 text-gray-400" />
          ) : (
            <IoChevronDownCircleOutline className="w-4 h-4 text-gray-400" />
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Notes</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {noteCount}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Note Input */}
          <div className=" w-full flex flex-col gap-2 p-3 border border-gray-200 rounded-lg">
            <textarea
              ref={textareaRef}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter note..."
              className="w-full p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-transparent"
              rows={3}
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadPending}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <PaperClipOutlined className="w-4 h-4" />
                  {isUploadPending ? "Uploading..." : "Attach file"}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitNote}
                  disabled={isSubmitting || !hasContent}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting
                    ? "Saving..."
                    : existingNotes
                    ? "Update"
                    : "Save"}
                </Button>
              </div>
            </div>
          </div>

          {/* Attachments Display */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      {getFileIcon(attachment.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {attachment.url && (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View
                        </a>
                      )}

                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="text-black-900 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <CloseOutlined />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
        </div>
      )}

      {/* Preview of existing note when collapsed */}
      {!isExpanded && hasContent && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3 border">
            {noteText && (
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                {noteText}
              </p>
            )}
            {attachments.length > 0 && (
              <div className="flex items-center gap-2">
                <GiPaperClip className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {attachments.length} attachment
                  {attachments.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesComponent;
