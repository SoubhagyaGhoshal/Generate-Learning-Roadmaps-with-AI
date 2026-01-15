"use client";
import {
  changeRoadmapVisibility,
  checkIfTitleInUsersRoadmaps,
  deleteRoadmapById,
  isRoadmapGeneratedByUser,
  saveToUserDashboard,
} from "@/actions/roadmaps";
import { bannedWords } from "@/lib/shared/constants";
import { userHasCredits } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Visibility } from "@prisma/client";
import { UseMutateFunction } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Save, Trash, ArrowLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { PresetShare } from "@/components/roadmap/preset-share";
import { useUIStore } from "@/lib/stores";
import GenerateButton from "@/components/flow-components/generate-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  title?: string;
  roadmapId: string;
  isPending: boolean;
  renderFlow: string;
  dbRoadmapId: string;
  visibility?: Visibility;
  mutate: UseMutateFunction<any, AxiosError<unknown, any>, any, unknown>;
}

export const GeneratorControls = (props: Props) => {
  const {
    title,
    mutate,
    roadmapId,
    isPending,
    renderFlow,
    dbRoadmapId,
    visibility: initialVisibility,
  } = props;
  const [visibility, setVisibility] = useState(initialVisibility);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canSaveToDashboard, setCanSaveToDashboard] = useState(false);
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const router = useRouter();

  const { model, query, setQuery } = useUIStore(
    useShallow((state) => ({
      model: state.model,
      query: state.query,
      setQuery: state.setQuery,
    })),
  );

  // Popular topics for auto-generation
  const popularTopics = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "Machine Learning",
    "DevOps",
    "AWS",
    "Docker",
    "Kubernetes",
    "TypeScript",
    "C++",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "Flutter",
    "Angular",
    "Vue.js",
    "Django",
    "Spring Boot",
    "Laravel",
    ".NET",
    "GraphQL",
    "MongoDB",
    "PostgreSQL",
    "Redis",
    "Elasticsearch",
    "Apache Kafka",
    "RabbitMQ",
    "Jenkins",
    "GitHub Actions",
    "Terraform",
    "Ansible",
    "AWS Lambda",
    "Serverless",
    "IoT",
    "Blockchain",
    "Cryptocurrency",
    "Smart Contracts",
    "Solidity",
    "Web3",
    "DeFi",
    "NFT",
    "Metaverse",
    "AR/VR",
    "Computer Vision",
    "Natural Language Processing",
    "Deep Learning",
    "Neural Networks",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "OpenCV",
    "NLTK",
    "spaCy",
    "BERT",
    "GPT",
    "Transformer",
    "CNN",
    "RNN",
    "LSTM",
    "GAN",
    "Reinforcement Learning",
    "Data Engineering",
    "ETL",
    "Data Warehousing",
    "Big Data",
    "Hadoop",
    "Spark",
    "Airflow",
    "dbt",
    "Snowflake",
    "Redshift",
    "BigQuery",
    "Tableau",
    "Power BI",
    "Jupyter",
    "Streamlit",
    "Dash",
    "Plotly",
    "Pandas",
    "NumPy",
    "SciPy",
    "Statistics",
    "Probability",
    "Linear Algebra",
    "Calculus",
    "Optimization",
    "Algorithms",
    "Data Structures",
    "Design Patterns",
    "Clean Code",
    "SOLID Principles",
    "TDD",
    "BDD",
    "DDD",
    "Microservices Architecture",
    "Event-Driven Architecture",
    "CQRS",
    "Event Sourcing",
    "Domain-Driven Design",
    "Clean Architecture",
    "Repository Pattern",
    "Factory Pattern",
    "Observer Pattern",
    "Strategy Pattern",
    "Command Pattern",
    "Adapter Pattern",
    "Decorator Pattern",
    "Singleton Pattern",
    "Builder Pattern",
    "Prototype Pattern",
    "Facade Pattern",
    "Proxy Pattern",
    "Bridge Pattern",
    "Composite Pattern",
    "Flyweight Pattern",
    "Template Method Pattern",
    "Chain of Responsibility Pattern",
    "Mediator Pattern",
    "Memento Pattern",
    "State Pattern",
    "Visitor Pattern",
    "Interpreter Pattern",
    "Iterator Pattern",
    "MVC",
    "MVP",
    "MVVM",
    "Flux",
    "Redux",
    "MobX",
    "Zustand",
    "Recoil",
    "Jotai",
    "XState",
    "FSM",
    "State Machine",
    "Workflow Engine",
    "BPMN",
    "Business Process Management",
    "Workflow Automation",
    "RPA",
    "UiPath",
    "Automation Anywhere",
    "Blue Prism",
    "Power Automate",
    "Zapier",
    "IFTTT",
    "Webhooks",
    "API Gateway",
    "Service Mesh",
    "Istio",
    "Linkerd",
    "Consul",
    "Envoy",
    "Load Balancer",
    "CDN",
    "CloudFront",
    "CloudFlare",
    "Akamai",
    "Vercel",
    "Netlify",
    "Heroku",
    "Railway",
    "Render",
    "DigitalOcean",
    "Linode",
    "Vultr",
    "AWS EC2",
    "Azure VM",
    "Google Compute Engine",
    "AWS S3",
    "Azure Blob Storage",
    "Google Cloud Storage",
    "AWS RDS",
    "Azure SQL Database",
    "Google Cloud SQL",
    "AWS DynamoDB",
    "Azure Cosmos DB",
    "Google Firestore",
    "AWS Lambda",
    "Azure Functions",
    "Google Cloud Functions",
    "AWS API Gateway",
    "Azure API Management",
    "Google Cloud Endpoints",
    "AWS CloudFormation",
    "Azure Resource Manager",
    "Google Cloud Deployment Manager",
    "Terraform",
    "Pulumi",
    "CloudFormation",
    "SAM",
    "Serverless Framework",
    "Zappa",
    "Chalice",
    "AWS Amplify",
    "Azure Static Web Apps",
    "Google Firebase",
    "Supabase",
    "Hasura",
    "Strapi",
    "Sanity",
    "Contentful",
    "Prismic",
    "Ghost",
    "WordPress",
    "Drupal",
    "Joomla",
    "Magento",
    "Shopify",
    "WooCommerce",
    "BigCommerce",
    "Salesforce",
    "HubSpot",
    "Pipedrive",
    "Zoho",
    "Monday.com",
    "Asana",
    "Trello",
    "Jira",
    "Confluence",
    "Notion",
    "Airtable",
    "Coda",
    "Figma",
    "Sketch",
    "Adobe XD",
    "InVision",
    "Marvel",
    "Framer",
    "Webflow",
    "Bubble",
    "Zapier",
    "Make",
    "n8n",
    "Retool",
    "Appsmith",
    "Budibase",
    "Tooljet",
    "AppGyver",
    "OutSystems",
    "Mendix",
    "Power Apps",
    "Power Automate",
    "Power BI",
    "Power Query",
    "DAX",
    "M",
    "Power Fx",
    "Power Virtual Agents",
    "Power Platform",
    "Microsoft 365",
    "SharePoint",
    "Teams",
    "OneDrive",
    "OneNote",
    "Outlook",
    "Excel",
    "Word",
    "PowerPoint",
    "Access",
    "Publisher",
    "Visio",
    "Project",
    "Planner",
    "To Do",
    "Forms",
    "Sway",
    "Stream",
    "Yammer",
    "Delve",
    "Power BI",
    "Power Apps",
    "Power Automate",
    "Power Virtual Agents",
    "Power Platform",
    "Dynamics 365",
    "Azure DevOps",
    "GitHub",
    "GitLab",
    "Bitbucket",
    "SourceTree",
    "GitKraken",
    "VS Code",
    "IntelliJ IDEA",
    "Eclipse",
    "NetBeans",
    "Visual Studio",
    "Xcode",
    "Android Studio",
    "Sublime Text",
    "Atom",
    "Vim",
    "Emacs",
    "Nano",
    "Notepad++",
    "Brackets",
    "WebStorm",
    "PhpStorm",
    "PyCharm",
    "DataGrip",
    "CLion",
    "Rider",
    "AppCode",
    "GoLand",
    "RubyMine"
  ];

  // Function to get a random topic
  const getRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * popularTopics.length);
    return popularTopics[randomIndex];
  };

  useEffect(() => {
    const checkRoadmapStatus = async () => {
      if (dbRoadmapId) {
        const { isGeneratedByUser, isSavedByUser, isAuthor } =
          await isRoadmapGeneratedByUser(dbRoadmapId);
        setCanSaveToDashboard(!isGeneratedByUser && !isSavedByUser);
        setShowVisibilityDropdown(isGeneratedByUser);
        setIsAuthor(isAuthor);
      }
    };
    checkRoadmapStatus();

    // Redirect if roadmapId changes
    if (roadmapId) {
      router.push(`/roadmap/${roadmapId}`);
    }
  }, [model, dbRoadmapId, roadmapId, router]);

  const onSubmit = async () => {
    let currentQuery = query.trim();

    // If query is empty and this is auto-generate, set a random topic
    if (!currentQuery) {
      const randomTopic = getRandomTopic();
      setQuery(randomTopic);
      currentQuery = randomTopic;

      // Show a toast to inform the user
      toast.success("Auto-generated topic", {
        description: `Generating roadmap for: ${randomTopic}`,
        duration: 3000,
      });
    }

    if (!currentQuery) {
      return toast.error("Please enter a topic", {
        description: "Enter a topic to generate a roadmap.",
        duration: 4000,
      });
    }

    // Check for banned words
    const hasBannedWord = bannedWords.some((word) =>
      currentQuery.toLowerCase().includes(word.toLowerCase())
    );

    if (hasBannedWord) {
      return toast.error("Invalid topic", {
        description: "Please enter a valid learning topic.",
        duration: 4000,
      });
    }

    // Everyone has unlimited credits now
    mutate({
      body: { query: currentQuery },
    });
  };

  const onValueChange = async (value: Visibility) => {
    await changeRoadmapVisibility(dbRoadmapId, value);
    setVisibility(value); // Update visibility state
  };

  // Utility function to format visibility
  const formatVisibility = (visibility?: Visibility) => {
    switch (visibility) {
      case Visibility.PUBLIC:
        return "Public";
      case Visibility.PRIVATE:
        return "Private";
      default:
        return "Private";
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteRoadmapById(dbRoadmapId);
      if (response.status === "success") {
        toast.success("Roadmap deleted successfully", {
          description: "The roadmap has been permanently deleted.",
          duration: 4000,
        });
        router.push("/roadmap");
      } else {
        toast.error("Error", {
          description: response?.message,
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete roadmap.",
        duration: 4000,
      });
    }
  };

  const handleSaveToDashboard = async () => {
    const response = await saveToUserDashboard(dbRoadmapId);
    if (response && response.status === "success") {
      toast.success("Success", {
        description: "Roadmap has been saved to your dashboard",
        duration: 4000,
      });
      setCanSaveToDashboard(false);
    } else {
      toast.error("Error", {
        description: response?.message,
        duration: 4000,
      });
    }
  };

  const disableUI = isGenerating || isPending;

  return (
    <div className="relative">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50 rounded-2xl" />

      <div className="relative container flex flex-col items-start justify-between space-y-6 py-8 sm:flex-row sm:items-center sm:space-y-0">
        <div className="flex w-full flex-col space-y-6 sm:flex-row sm:items-center sm:space-x-6 sm:space-y-0">
          {!dbRoadmapId && (
            <div className="flex-1 relative group">
              {/* Animated border gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm" />

              <Input
                type="text"
                disabled={disableUI}
                placeholder="Enter any topic (e.g., Java, Python, React, Machine Learning, DevOps, AWS, Docker, Kubernetes, TypeScript, C++, Go, Rust, Swift, Kotlin, Flutter, Angular, Vue.js, Django, Spring Boot, Laravel, .NET, GraphQL, MongoDB, PostgreSQL, Redis, Elasticsearch, Apache Kafka, RabbitMQ, Jenkins, GitHub Actions, Terraform, Ansible, AWS Lambda, Serverless, IoT, Blockchain, Cryptocurrency, Smart Contracts, Solidity, Web3, DeFi, NFT, Metaverse, AR/VR, Computer Vision, Natural Language Processing, Deep Learning, Neural Networks, TensorFlow, PyTorch, Scikit-learn, OpenCV, NLTK, spaCy, BERT, GPT, Transformer, CNN, RNN, LSTM, GAN, Reinforcement Learning, Data Engineering, ETL, Data Warehousing, Big Data, Hadoop, Spark, Airflow, dbt, Snowflake, Redshift, BigQuery, Tableau, Power BI, Jupyter, Streamlit, Dash, Plotly, Pandas, NumPy, SciPy, Statistics, Probability, Linear Algebra, Calculus, Optimization, Algorithms, Data Structures, Design Patterns, Clean Code, SOLID Principles, TDD, BDD, DDD, Microservices Architecture, Event-Driven Architecture, CQRS, Event Sourcing, Domain-Driven Design, Clean Architecture, Repository Pattern, Factory Pattern, Observer Pattern, Strategy Pattern, Command Pattern, Adapter Pattern, Decorator Pattern, Singleton Pattern, Builder Pattern, Prototype Pattern, Facade Pattern, Proxy Pattern, Bridge Pattern, Composite Pattern, Flyweight Pattern, Template Method Pattern, Chain of Responsibility Pattern, Mediator Pattern, Memento Pattern, State Pattern, Visitor Pattern, Interpreter Pattern, Iterator Pattern, MVC, MVP, MVVM, Flux, Redux, MobX, Zustand, Recoil, Jotai, XState, FSM, State Machine, Workflow Engine, BPMN, Business Process Management, Workflow Automation, RPA, UiPath, Automation Anywhere, Blue Prism, Power Automate, Zapier, IFTTT, Webhooks, API Gateway, Service Mesh, Istio, Linkerd, Consul, Envoy, Load Balancer, CDN, CloudFront, CloudFlare, Akamai, Vercel, Netlify, Heroku, Railway, Render, DigitalOcean, Linode, Vultr, AWS EC2, Azure VM, Google Compute Engine, AWS S3, Azure Blob Storage, Google Cloud Storage, AWS RDS, Azure SQL Database, Google Cloud SQL, AWS DynamoDB, Azure Cosmos DB, Google Firestore, AWS Lambda, Azure Functions, Google Cloud Functions, AWS API Gateway, Azure API Management, Google Cloud Endpoints, AWS CloudFormation, Azure Resource Manager, Google Cloud Deployment Manager, Terraform, Pulumi, CloudFormation, SAM, Serverless Framework, Zappa, Chalice, AWS Amplify, Azure Static Web Apps, Google Firebase, Supabase, Hasura, Strapi, Sanity, Contentful, Prismic, Ghost, WordPress, Drupal, Joomla, Magento, Shopify, WooCommerce, BigCommerce, Salesforce, HubSpot, Pipedrive, Zoho, Monday.com, Asana, Trello, Jira, Confluence, Notion, Airtable, Coda, Figma, Sketch, Adobe XD, InVision, Marvel, Framer, Webflow, Bubble, Zapier, Make, n8n, Retool, Appsmith, Budibase, Tooljet, AppGyver, OutSystems, Mendix, Power Apps, Power Automate, Power BI, Power Query, DAX, M, Power Fx, Power Virtual Agents, Power Platform, Microsoft 365, SharePoint, Teams, OneDrive, OneNote, Outlook, Excel, Word, PowerPoint, Access, Publisher, Visio, Project, Planner, To Do, Forms, Sway, Stream, Yammer, Delve, Power BI, Power Apps, Power Automate, Power Virtual Agents, Power Platform, Dynamics 365, Azure DevOps, GitHub, GitLab, Bitbucket, SourceTree, GitKraken, VS Code, IntelliJ IDEA, Eclipse, NetBeans, Visual Studio, Xcode, Android Studio, Sublime Text, Atom, Vim, Emacs, Nano, Notepad++, Brackets, WebStorm, PhpStorm, PyCharm, DataGrip, CLion, Rider, AppCode, GoLand, RubyMine)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSubmit();
                  }
                }}
                className="relative h-14 text-lg border-2 border-gray-200/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl bg-white/90 backdrop-blur-sm group-hover:border-indigo-400"
              />
            </div>
          )}

          {dbRoadmapId && (
            <div className="flex-1 -ml-6 md:ml-0">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="group bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/80 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Back
              </Button>
            </div>
          )}

          {!dbRoadmapId && (
            <div className="flex items-center space-x-3">
              <GenerateButton
                onClick={onSubmit}
                disabled={disableUI}
                isPending={isPending}
                autoGenerate={true}
              />
            </div>
          )}

          {isAuthor && (
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer bg-red-50/80 backdrop-blur-sm border-red-200 hover:bg-red-100/80 hover:border-red-300 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg group"
              onClick={handleDelete}
            >
              <Trash className="cursor-pointer text-red-500 group-hover:text-red-600 transition-colors duration-300" size="18px" />
            </Button>
          )}

          {!showVisibilityDropdown && dbRoadmapId && canSaveToDashboard && (
            <Button
              onClick={handleSaveToDashboard}
              size="icon"
              variant="outline"
              className="bg-green-50/80 backdrop-blur-sm border-green-200 hover:bg-green-100/80 hover:border-green-300 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg group"
            >
              <TooltipProvider>
                <Tooltip delayDuration={400}>
                  <TooltipTrigger>
                    <Save className="text-green-500 group-hover:text-green-600 transition-colors duration-300" size="18px" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-green-50 border-green-200">
                    <p className="text-green-800">Save to Dashboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>
          )}

          {showVisibilityDropdown && (
            <Select onValueChange={onValueChange} value={visibility}>
              <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg">
                <SelectValue placeholder={formatVisibility(initialVisibility)} />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-xl">
                <SelectItem value={Visibility.PUBLIC} className="hover:bg-indigo-50 transition-colors duration-200">Public</SelectItem>
                <SelectItem value={Visibility.PRIVATE} className="hover:bg-indigo-50 transition-colors duration-200">Private</SelectItem>
              </SelectContent>
            </Select>
          )}

          {renderFlow && dbRoadmapId && (
            <div className="flex space-x-3">
              <PresetShare key={renderFlow} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
