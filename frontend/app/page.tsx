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
  CircularProgress,
} from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { useMemo, useState } from "react";
import { IoSend } from "react-icons/io5";
import { FaExpand } from "react-icons/fa6";
import MetricsList from "@/components/metrics/metrics-list";
import { useSearchParams } from "next/navigation";

//TODO: throttling
export default function Home() {
  const [apiData, setApiData] = useState<ArticleAnalysis | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [userInput, setUserInput] = useState(query ?? "");

  return (
    <section className="flex flex-row h-full w-full gap-4 p-5">
      <div style={{ width: "100%" }}>
        <Card style={{ width: "100%", height: "100%" }}>
          <Textarea
            fullWidth
            disableAutosize
            className="w-full h-full 123123"
            classNames={{
              inputWrapper: "!h-full",
              input: "!h-full",
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
            <div className="flex justify-between items-center  ">
              <p className="p-1">Results:</p>
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
              className="h-full gap-5 items-center align-center"
              style={{ overflowX: "hidden" }}
            >
              <MetricsList data={apiData} />
            </ScrollShadow>
          </CardBody>
        </Card>
        <Button
          color="success"
          onPress={() => {
            const fetchData = async () => {
              const response = await makeRequest(userInput);

              setApiData(response);
            };

            fetchData();
          }}
          style={{
            color: "hsl(var(--heroui-foreground) / 1)",
          }}
        >
          <IoSend size={24} color="hsl(var(--heroui-foreground) / 1)" />
          Get Report
        </Button>
      </div>
      <Modal
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        backdrop={"blur"}
        size="lg"
        style={{ maxWidth: "unset", width: "80vw", maxHeight: "85vh" }}
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
