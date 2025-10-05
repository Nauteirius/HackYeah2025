"use client";

import MetricScore from "@/components/metrics/metric-score";
import { ArticleAnalysis } from "@/models/articleAnalysis.types";
import { makeRequest } from "@/repository/api";
import { interpolateColor } from "@/utils/utils";
import {
  Button,
  ScrollShadow,
  Textarea,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  CircularProgress, // Make sure CircularProgress is imported
} from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { useState } from "react"; // `useMemo` is no longer needed
import { IoSend } from "react-icons/io5";
import { FaExpand } from "react-icons/fa6";
import MetricsList from "@/components/metrics/metrics-list";
import { useSearchParams } from "next/navigation";

// No throttling needed for this approach, as the button is disabled during the request.
export default function Home() {
  const [apiData, setApiData] = useState<ArticleAnalysis | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [userInput, setUserInput] = useState(query ?? "");

  // 1. Add a new state to track the loading status
  const [isLoading, setIsLoading] = useState(false);

  // 2. Update the function that handles the API call
  const handleAnalysisRequest = async () => {
    if (!userInput.trim()) return; // Optional: prevent empty requests

    setIsLoading(true);
    setApiData(null); // Clear previous results immediately

    try {
      const response = await makeRequest(userInput);
      setApiData(response);
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
      // Optionally, set an error state here to show a message to the user
    } finally {
      setIsLoading(false); // This will run after the try or catch block completes
    }
  };

  return (
    <section className="flex flex-row h-full w-full gap-4 p-5">
      <div style={{ width: "100%" }}>
        <Card style={{ width: "100%", height: "100%" }}>
          <Textarea
            fullWidth
            disableAutosize
            className="w-full h-full"
            classNames={{
              inputWrapper: "!h-full",
              input: "!h-full",
              label: "text-xl py-3",
            }}
            label="Analyze Your Text"
            placeholder="Enter your description"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
        </Card>
      </div>
      <div
        style={{
          width: 500,
          display: "flex",
          flexDirection: "column",
        }}
        className="gap-3"
      >
        <Card style={{ flex: 1 }}>
          <CardBody style={{ display: "flex", maxHeight: "80vh" }}>
            <div className="flex justify-between items-center">
              <p className="p-1 text-lg">Results:</p>
              <Button
                hidden={apiData == null}
                isIconOnly
                variant="light"
                onPress={onOpen}
              >
                <FaExpand />
              </Button>
            </div>

            <ScrollShadow
              className="h-full w-full flex items-start justify-center" // Centering classes
              style={{ overflowX: "hidden" }}
            >
              {/* 3. Conditionally render the spinner or the results */}
              {isLoading ? (
                <div
                  className="flex justify-center items-center"
                  style={{ height: "100%" }}
                >
                  <CircularProgress aria-label="Analyzing text..." />
                </div>
              ) : (
                <MetricsList data={apiData} />
              )}
            </ScrollShadow>
          </CardBody>
        </Card>
        <Button
          color="success"
          onPress={handleAnalysisRequest}
          // 4. Disable the button and change text while loading
          isDisabled={isLoading}
          style={{
            color: "hsl(var(--heroui-foreground) / 1)",
          }}
        >
          {isLoading ? (
            "Analyzing..."
          ) : (
            <>
              <IoSend size={24} color="hsl(var(--heroui-foreground) / 1)" />
              Get Report
            </>
          )}
        </Button>
      </div>
      {/* The Modal remains unchanged and will work correctly */}
      <Modal
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        backdrop={"blur"}
        size="lg"
        style={{ maxWidth: "unset", width: "80vw", maxHeight: "83vh" }}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Analysis Details
              </ModalHeader>
              <ModalBody className="overflow-auto">
                <ScrollShadow className="h-full w-full">
                  <MetricsList data={apiData} isModal={true} />
                </ScrollShadow>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}
