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
} from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { useMemo, useState } from "react";
import { IoSend } from "react-icons/io5";
import { FaExpand } from "react-icons/fa6";
import MetricsList from "@/components/metrics/metrics-list";

//TODO: throttling
export default function Home() {
  const [apiData, setApiData] = useState<ArticleAnalysis>();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <section className="flex flex-row h-full w-full gap-4 p-5">
      <div style={{ width: "100%" }}>
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
        />
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
              <Button isIconOnly variant="light" onPress={onOpen}>
                <FaExpand />
              </Button>
            </div>

            <ScrollShadow
              className="grid grid-cols-2 gap-5 items-center align-center"
              style={{ overflowX: "hidden" }}
            >
              <MetricsList data={null as unknown as ArticleAnalysis} />
            </ScrollShadow>
          </CardBody>
        </Card>
        <Button
          color="success"
          onPress={() => {
            const fetchData = async () => {
              const response = await makeRequest("MOCK");

              setApiData(response);
            };
          }}
        >
          <IoSend size={24} />
          Get Report
        </Button>
      </div>
      <Modal
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        backdrop={"blur"}
        size="lg"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Modal Title
              </ModalHeader>
              <ModalBody className="w-full grid">
                <MetricsList data={null as unknown as ArticleAnalysis} collect />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}
