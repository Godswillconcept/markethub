import { useRef, useCallback, useEffect } from "react";
import Tags from "@yaireo/tagify/dist/react.tagify";
import "@yaireo/tagify/dist/tagify.css";
import "./TagifyTags.css";
import axiosInstance from "../../services/axios.js";

const TagifyTags = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Add tags...",
}) => {
  const tagifyRef = useRef();
  const controllerRef = useRef();

  const settings = {
    whitelist: [],
    dropdown: {
      enabled: 0, // Show suggestions on first character
      maxItems: 10,
      closeOnSelect: false,
      highlightFirst: true,
    },
    enforceWhitelist: false, // Allow custom tags
    maxTags: 20,
    duplicates: false,
    trim: true,
    placeholder: placeholder,
  };

  // Fetch tag suggestions from API
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) return;

    try {
      const { data } = await axiosInstance.get(`/journals/tags/suggestions`, {
        params: { q: query },
        signal: controllerRef.current?.signal,
      });

      // Transform API response to tagify format
      const suggestions = data.data.map((item) => ({
        value: item.tag,
        count: item.count,
      }));

      return suggestions;
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Failed to fetch tag suggestions:", error);
      }
      return [];
    }
  }, []);

  // Handle input event for async suggestions
  const onInput = useCallback(
    async (e) => {
      const value = e.detail.value;
      const tagify = tagifyRef.current;

      if (!tagify || value.length < 2) return;

      // Abort previous request
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      controllerRef.current = new AbortController();

      // Show loading
      tagify.loading(true);

      try {
        const suggestions = await fetchSuggestions(value);

        // Merge existing tags with suggestions to prevent removal
        const existingTags = tagify.value.map((tag) => tag.value);
        const mergedWhitelist = [
          ...new Set([...existingTags, ...suggestions.map((s) => s.value)]),
        ];

        tagify.whitelist = mergedWhitelist;
        tagify.loading(false).dropdown.show(value);
      } catch (error) {
        tagify.loading(false);
      }
    },
    [fetchSuggestions],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return (
    <Tags
      tagifyRef={tagifyRef}
      settings={settings}
      value={value}
      onChange={(e) => {
        // Convert tagify format to comma-separated string
        const tags = e.detail.tagify.value.map((tag) => tag.value);
        onChange(tags.join(", "));
      }}
      onInput={onInput}
      disabled={disabled}
      className="tagify-custom"
    />
  );
};

export default TagifyTags;
